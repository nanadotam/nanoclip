<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$database = new Database();
$conn = $database->connect();

if ($conn) {
    echo "Database connection successful!";
} else {
    echo "Database connection failed!";
}
?> 