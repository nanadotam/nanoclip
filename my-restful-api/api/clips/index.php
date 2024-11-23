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

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['url_slug'])) {
            $clip->url_slug = $_GET['url_slug'];
            $result = $clip->read_single();
            echo json_encode($result);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        $clip->url_slug = $data->url_slug;
        $clip->content_type = $data->content_type;
        $clip->text_content = $data->text_content ?? null;
        $clip->file_url = $data->file_url ?? null;
        $clip->file_metadata = $data->file_metadata ?? null;
        $clip->password_hash = $data->password_hash ? password_hash($data->password_hash, PASSWORD_DEFAULT) : null;
        $clip->expires_at = $data->expires_at ?? null;

        if($clip->create()) {
            echo json_encode(["message" => "Clip created"]);
        } else {
            echo json_encode(["message" => "Error creating clip"]);
        }
        break;
} 