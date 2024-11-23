<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
        $result = $clip->read_single();

        if (!$result) {
            send_error('Clip not found', 404);
        }

        // If clip is password protected and password is provided
        if (isset($_GET['password']) && $result['is_protected']) {
            if (!$clip->verify_password($_GET['url_slug'], $_GET['password'])) {
                send_error('Invalid password', 401);
            }
        }

        echo json_encode($result);
        break;

    case 'POST':
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

        try {
            if($clip->create()) {
                echo json_encode([
                    "message" => "Clip created",
                    "url_slug" => $clip->url_slug
                ]);
            } else {
                send_error('Error creating clip', 500);
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