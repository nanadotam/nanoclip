<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Clip-Password");
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Clip.php';

$database = new Database();
$db = $database->connect();
$clip = new Clip($db);

function send_error($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
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
            $clip->expires_at = $data->expires_at ?? null;

            if($clip->create()) {
                echo json_encode([
                    "message" => "Clip created",
                    "url_slug" => $clip->url_slug
                ]);
            }
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() == 1062) {  // MySQL duplicate entry error code
                send_error('This URL is already taken. Please choose a different one.', 409);
            } else {
                send_error('Database error: ' . $e->getMessage(), 500);
            }
        } catch (Exception $e) {
            send_error($e->getMessage(), 500);
        }
        break;

    case 'OPTIONS':
        http_response_code(200);
        break;

    default:
        send_error('Method not allowed', 405);
} 