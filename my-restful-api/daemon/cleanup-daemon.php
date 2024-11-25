<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Clip.php';

// Set up error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/cleanup-daemon.log');

class CleanupDaemon {
    private $pidFile;
    private $isRunning = false;

    public function __construct() {
        $this->pidFile = __DIR__ . '/../data/cleanup-daemon.pid';
    }

    public function start() {
        if ($this->isAlreadyRunning()) {
            error_log("Cleanup daemon is already running");
            return false;
        }

        // Fork the process
        $pid = pcntl_fork();

        if ($pid === -1) {
            error_log("Could not fork process");
            return false;
        }

        if ($pid) {
            // Parent process
            file_put_contents($this->pidFile, $pid);
            return true;
        }

        // Child process
        posix_setsid();
        $this->isRunning = true;
        $this->run();
    }

    private function isAlreadyRunning() {
        if (!file_exists($this->pidFile)) {
            return false;
        }

        $pid = (int)file_get_contents($this->pidFile);
        if (posix_kill($pid, 0)) {
            return true;
        }

        unlink($this->pidFile);
        return false;
    }

    private function run() {
        try {
            $database = new Database();
            $db = $database->connect();
            $clip = new Clip($db);

            while ($this->isRunning) {
                try {
                    $clip->deleteExpiredClips();
                    error_log("Cleanup executed at " . date('Y-m-d H:i:s'));
                } catch (Exception $e) {
                    error_log("Cleanup iteration error: " . $e->getMessage());
                }
                sleep(60); // Check every minute
            }
        } catch (Exception $e) {
            error_log("Fatal daemon error: " . $e->getMessage());
        } finally {
            @unlink($this->pidFile);
        }
    }

    public function stop() {
        if (file_exists($this->pidFile)) {
            $pid = (int)file_get_contents($this->pidFile);
            posix_kill($pid, SIGTERM);
            unlink($this->pidFile);
        }
    }
}
