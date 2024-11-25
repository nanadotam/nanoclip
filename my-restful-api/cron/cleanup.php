<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Clip.php';
require_once __DIR__ . '/../config/FileConfig.php';

// Prevent concurrent cleanup processes
$lockFile = __DIR__ . '/cleanup.lock';

if (file_exists($lockFile)) {
    $lockTime = filemtime($lockFile);
    // If lock is older than 10 minutes, assume previous process died
    if (time() - $lockTime > 600) {
        unlink($lockFile);
    } else {
        exit("Cleanup already running\n");
    }
}

// Create lock file
touch($lockFile);

try {
    $database = new Database();
    $db = $database->connect();
    $clip = new Clip($db);
    
    // Run cleanup
    $clip->deleteExpiredClips();
    
} catch (Exception $e) {
    error_log("Cleanup failed: " . $e->getMessage());
} finally {
    // Remove lock file
    unlink($lockFile);
}
