<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Clip.php';

// Set up error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/cleanup-daemon.log');

function cleanup() {
    try {
        $database = new Database();
        $db = $database->connect();
        $clip = new Clip($db);
        
        while (true) {
            $clip->deleteExpiredClips();
            error_log("Cleanup executed at " . date('Y-m-d H:i:s'));
            sleep(60); // Check every minute
        }
    } catch (Exception $e) {
        error_log("Cleanup daemon error: " . $e->getMessage());
    }
}

// Run the cleanup function
cleanup();
