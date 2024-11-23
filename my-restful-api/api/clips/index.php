<?php
ini_set('upload_max_filesize', '100M');
ini_set('post_max_size', '100M');
ini_set('memory_limit', '256M');
ini_set('max_execution_time', 300);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Clip-Password");
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Clip.php';
require_once __DIR__ . '/../../config/FileConfig.php';

try {
    FileConfig::init();
    
    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $clip = new Clip($db);
    
    // Run background cleanup without blocking
    register_shutdown_function(function() use ($clip) {
        try {
            $clip->backgroundCleanup();
        } catch (Exception $e) {
            error_log("Shutdown cleanup error: " . $e->getMessage());
        }
    });

    function send_error($message, $code = 400) {
        http_response_code($code);
        echo json_encode(['error' => $message]);
        exit;
    }

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            if (isset($_GET['download']) && isset($_GET['filename'])) {
                try {
                    $fileInfo = $clip->downloadFile($_GET['filename']);
                    
                    // Set headers for download
                    header('Content-Type: ' . $fileInfo['mime']);
                    header('Content-Disposition: attachment; filename="' . $fileInfo['name'] . '"');
                    header('Content-Length: ' . filesize($fileInfo['path']));
                    header('Cache-Control: no-cache');
                    
                    // Output file content
                    readfile($fileInfo['path']);
                    exit;
                } catch (Exception $e) {
                    send_error($e->getMessage(), 404);
                }
            }

            if(!isset($_GET['url_slug'])) {
                send_error('URL slug is required');
            }

            $clip->url_slug = $_GET['url_slug'];
            
            $password = $_SERVER['HTTP_X_CLIP_PASSWORD'] ?? null;
            
            if ($password && $clip->verify_password($password)) {
                $result = $clip->read_single(true);
            } else {
                $result = $clip->read_single(false);
            }

            if (!$result) {
                send_error('Clip not found', 404);
            }

            echo json_encode($result);
            break;

        case 'POST':
            try {
                // Check if this is a multipart form data request
                if (strpos($_SERVER["CONTENT_TYPE"], "multipart/form-data") !== false) {
                    // Validate required fields
                    if (!isset($_POST['url_slug']) || empty($_POST['url_slug'])) {
                        send_error('URL slug is required');
                    }

                    // Handle file upload
                    $fileMetadata = $clip->handleFileUpload($_FILES);
                    
                    $clip->url_slug = $_POST['url_slug'];
                    $clip->content_type = 'file';
                    $clip->text_content = $_POST['text_content'] ?? null;
                    $clip->file_metadata = $fileMetadata;
                    $clip->password_hash = !empty($_POST['password']) ? password_hash($_POST['password'], PASSWORD_DEFAULT) : null;
                    $clip->expires_at = !empty($_POST['expire_option']) ? $clip->calculateExpiryDate($_POST['expire_option']) : null;
                    $clip->is_view_once = $_POST['is_view_once'] ?? 0;
                } else {
                    // Handle regular JSON request
                    $data = json_decode(file_get_contents("php://input"));
                    
                    // Validate required fields
                    if (!isset($data->url_slug) || !isset($data->content_type)) {
                        send_error('URL slug and content type are required');
                    }

                    // Validate URL slug format
                    if (!preg_match('/^[a-zA-Z0-9-]+$/', $data->url_slug)) {
                        send_error('Invalid URL slug format. Use only letters, numbers, and hyphens');
                    }

                    $clip->url_slug = $data->url_slug;
                    $clip->content_type = $data->content_type;
                    $clip->text_content = $data->text_content ?? null;
                    $clip->file_url = $data->file_url ?? null;
                    $clip->file_metadata = $data->file_metadata ?? null;
                    $clip->password_hash = $data->password ? password_hash($data->password, PASSWORD_DEFAULT) : null;
                    $clip->expires_at = $data->expire_option ? $clip->calculateExpiryDate($data->expire_option) : null;
                    $clip->is_view_once = $data->is_view_once ?? 0;
                }

                if($clip->create()) {
                    echo json_encode([
                        "message" => "Clip created",
                        "url_slug" => $clip->url_slug,
                        "file_metadata" => $fileMetadata ?? null
                    ]);
                }
            } catch (Exception $e) {
                send_error($e->getMessage(), 400);
            }
            break;

        case 'OPTIONS':
            http_response_code(200);
            break;

        default:
            send_error('Method not allowed', 405);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    send_error("Internal server error", 500);
}