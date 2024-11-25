<?php
require_once __DIR__ . '/../config/FileConfig.php';

/**
 * Clip Class
 * Handles all clip-related operations including CRUD, file management, and cleanup
 * 
 * @package NanoClip
 */
class Clip {
    // Database connection and table name
    private $conn;
    private $table = 'clips';

    /**
     * Clip properties matching database schema
     * @var mixed
     */
    public $clip_id;
    public $url_slug;
    public $content_type;    // Type of content: 'text' or 'file'
    public $text_content;    // Stores text content if type is 'text'
    public $file_url;        // Deprecated: kept for backward compatibility
    public $file_metadata;   // JSON string containing file information
    public $password_hash;   // Stores hashed password if clip is protected
    public $created_at;      // Timestamp of creation
    public $expires_at;      // Timestamp for automatic deletion
    public $is_view_once;    // Boolean flag for single-view clips

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Read Single Clip Method
     * Handles password protection and view-once functionality
     * @param bool $include_password Whether to include password-protected content
     */
    public function read_single($include_password = false) {
        $query = 'SELECT * FROM ' . $this->table . ' WHERE url_slug = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $this->url_slug);
        $stmt->execute();
        $result = $stmt->get_result();
        $clip = $result->fetch_assoc();

        if ($clip) {
            $is_protected = !empty($clip['password_hash']);
            
            // If clip is password protected and full content not requested
            if ($is_protected && !$include_password) {
                return [
                    'url_slug' => $clip['url_slug'],
                    'is_protected' => true,
                    'created_at' => $clip['created_at'],
                    'message' => 'This clip is password protected'
                ];
            }

            // If it's a view-once clip and we're showing full content
            if ($clip['is_view_once'] == 1 && $include_password) {
                // Delete files if they exist
                if ($clip['file_metadata']) {
                    $files = json_decode($clip['file_metadata'], true);
                    foreach ($files as $file) {
                        $filepath = FileConfig::UPLOAD_DIR . $file['stored_name'];
                        if (file_exists($filepath)) {
                            if (!unlink($filepath)) {
                                error_log("Failed to delete file: " . $filepath);
                            }
                        }
                    }
                }
                
                // Delete the clip from database immediately
                $deleteQuery = 'DELETE FROM ' . $this->table . ' WHERE url_slug = ?';
                $deleteStmt = $this->conn->prepare($deleteQuery);
                $deleteStmt->bind_param('s', $this->url_slug);
                $deleteStmt->execute();
            }

            // Remove password hash from response
            unset($clip['password_hash']);
            $clip['is_protected'] = $is_protected;
            return $clip;
        }
        
        return null;
    }

    public function create() {
        $query = 'INSERT INTO ' . $this->table . ' 
            (url_slug, content_type, text_content, file_metadata, password_hash, expires_at, is_view_once) 
            VALUES (?, ?, ?, ?, ?, ?, ?)';

        $stmt = $this->conn->prepare($query);
        
        // Convert is_view_once to integer (0 or 1)
        $is_view_once = $this->is_view_once ? 1 : 0;
        
        $stmt->bind_param('ssssssi', 
            $this->url_slug,
            $this->content_type,
            $this->text_content,
            $this->file_metadata,
            $this->password_hash,
            $this->expires_at,
            $is_view_once
        );

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function verify_password($password) {
        $query = 'SELECT password_hash FROM ' . $this->table . ' WHERE url_slug = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $this->url_slug);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $clip = $result->fetch_assoc();

        if (!$clip || !$clip['password_hash']) {
            return false;
        }

        return password_verify($password, $clip['password_hash']);
    }

    public function calculateExpiryDate($expireOption) {
        if ($expireOption === 'view') {
            $this->is_view_once = 1;
            return null;
        }
        
        if (empty($expireOption)) {
            return null;
        }

        date_default_timezone_set('UTC');
        
        switch($expireOption) {
            case '1m':
                $date = new DateTime();
                return $date->modify('+1 minute')->format('Y-m-d H:i:s');
            case '10m':
                $date = new DateTime();
                return $date->modify('+10 minutes')->format('Y-m-d H:i:s');
            case '1h':
                $date = new DateTime();
                return $date->modify('+1 hour')->format('Y-m-d H:i:s');
            case '5h':
                $date = new DateTime();
                return $date->modify('+5 hours')->format('Y-m-d H:i:s');
            case '12h':
                $date = new DateTime();
                return $date->modify('+12 hours')->format('Y-m-d H:i:s');
            case '1d':
                $date = new DateTime();
                return $date->modify('+1 day')->format('Y-m-d H:i:s');
            case '1w':
                $date = new DateTime();
                return $date->modify('+1 week')->format('Y-m-d H:i:s');
            default:
                return null;
        }
    }

    public function delete() {
        $query = 'DELETE FROM ' . $this->table . ' WHERE url_slug = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $this->url_slug);
        return $stmt->execute();
    }

    private function shouldRunCleanup() {
        $lastCleanupFile = __DIR__ . '/../data/last_cleanup.txt';
        $lockFile = __DIR__ . '/../data/cleanup.lock';
        $cleanupInterval = 300; // 5 minutes
        
        // Check if cleanup is already running
        if (file_exists($lockFile)) {
            $lockTime = (int)file_get_contents($lockFile);
            // If lock is older than 10 minutes, it's probably stale
            if (time() - $lockTime < 600) {
                return false;
            }
        }
        
        // Create lock file
        file_put_contents($lockFile, time());
        
        if (!file_exists($lastCleanupFile)) {
            file_put_contents($lastCleanupFile, time());
            return true;
        }
        
        $lastCleanup = (int)file_get_contents($lastCleanupFile);
        if (time() - $lastCleanup >= $cleanupInterval) {
            file_put_contents($lastCleanupFile, time());
            return true;
        }
        
        // Remove lock if we're not going to run
        unlink($lockFile);
        return false;
    }

    public function backgroundCleanup() {
        try {
            if ($this->shouldRunCleanup()) {
                $result = $this->deleteExpiredClips();
                // Remove lock file after cleanup
                @unlink(__DIR__ . '/../data/cleanup.lock');
                return $result;
            }
            return true;
        } catch (Exception $e) {
            error_log("Background cleanup error: " . $e->getMessage());
            // Always try to remove lock file in case of error
            @unlink(__DIR__ . '/../data/cleanup.lock');
            return false;
        }
    }

    public function deleteExpiredClips() {
        // Get all expired clips (both file and text-only)
        $query = "SELECT * FROM {$this->table} WHERE 
                 (expires_at IS NOT NULL AND expires_at <= NOW()) OR
                 (is_view_once = 1 AND viewed_at IS NOT NULL)";
        
        $result = $this->conn->query($query);
        
        if (!$result) {
            error_log("Query failed: " . $this->conn->error);
            return false;
        }

        $deletedFiles = 0;
        $deletedClips = 0;
        $errors = [];

        while ($clip = $result->fetch_assoc()) {
            try {
                // Handle file-based clips
                if ($clip['file_metadata']) {
                    $files = json_decode($clip['file_metadata'], true);
                    if (is_array($files)) {
                        foreach ($files as $file) {
                            $filepath = FileConfig::UPLOAD_DIR . $file['stored_name'];
                            if (file_exists($filepath)) {
                                if (unlink($filepath)) {
                                    $deletedFiles++;
                                } else {
                                    $errors[] = "Failed to delete file: {$file['stored_name']}";
                                }
                            }
                        }
                    }
                }
                
                // Delete the clip entry (whether it's text-only or has files)
                $deleteQuery = "DELETE FROM {$this->table} WHERE id = ?";
                $stmt = $this->conn->prepare($deleteQuery);
                $stmt->bind_param('i', $clip['id']);
                
                if ($stmt->execute()) {
                    $deletedClips++;
                    error_log("Deleted clip: {$clip['url_slug']} " . 
                             ($clip['file_metadata'] ? "(with files)" : "(text-only)"));
                } else {
                    $errors[] = "Failed to delete clip ID: {$clip['id']}";
                }
                
                $stmt->close();
                
            } catch (Exception $e) {
                $errors[] = "Error processing clip {$clip['id']}: " . $e->getMessage();
            }
        }

        // Log cleanup results
        error_log("Cleanup completed: Deleted $deletedFiles files and $deletedClips clips");
        if (!empty($errors)) {
            error_log("Cleanup errors: " . implode(", ", $errors));
        }

        return true;
    }

    private function cleanupOrphanedFiles() {
        // 1. Get all stored filenames from database
        $query = "SELECT file_metadata FROM {$this->table} WHERE file_metadata IS NOT NULL";
        $result = $this->conn->query($query);
        
        $validFiles = [];
        while ($row = $result->fetch_assoc()) {
            $files = json_decode($row['file_metadata'], true);
            if (is_array($files)) {
                foreach ($files as $file) {
                    $validFiles[] = $file['stored_name'];
                }
            }
        }

        // 2. Scan upload directory
        $uploadDir = FileConfig::UPLOAD_DIR;
        $physicalFiles = scandir($uploadDir);
        
        // 3. Delete orphaned files
        foreach ($physicalFiles as $file) {
            if ($file === '.' || $file === '..') continue;
            
            if (!in_array($file, $validFiles)) {
                $filepath = $uploadDir . $file;
                if (unlink($filepath)) {
                    error_log("Deleted orphaned file: $file");
                } else {
                    error_log("Failed to delete orphaned file: $file");
                }
            }
        }
    }

    public function handleFileUpload($files) {
        if (empty($files)) {
            return null;
        }

        // Check number of files
        if (count($files['files']['name']) > FileConfig::MAX_FILES_PER_CLIP) {
            throw new Exception('Maximum ' . FileConfig::MAX_FILES_PER_CLIP . ' files allowed per clip');
        }

        $uploadedFiles = [];
        
        // Restructure files array
        for ($i = 0; $i < count($files['files']['name']); $i++) {
            $file = [
                'name' => $files['files']['name'][$i],
                'type' => $files['files']['type'][$i],
                'tmp_name' => $files['files']['tmp_name'][$i],
                'error' => $files['files']['error'][$i],
                'size' => $files['files']['size'][$i]
            ];

            // Validate file using our FileConfig security measures
            try {
                FileConfig::validateFile($file);
            } catch (Exception $e) {
                throw new Exception("Error with file {$file['name']}: " . $e->getMessage());
            }

            // Generate unique filename with original extension
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid() . '_' . time() . '.' . $ext;
            $filepath = FileConfig::UPLOAD_DIR . $filename;

            // Move file to uploads directory
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                $uploadedFiles[] = [
                    'original_name' => $file['name'],
                    'stored_name' => $filename,
                    'mime_type' => $file['type'],
                    'size' => $file['size'],
                    'category' => FileConfig::getFileCategory($file['type'])
                ];
            } else {
                throw new Exception("Failed to upload file: {$file['name']}");
            }
        }

        return json_encode($uploadedFiles);
    }

    public function downloadFile($filename) {
        $this->conn->begin_transaction();
        try {
            $filepath = FileConfig::UPLOAD_DIR . $filename;
            
            // Security checks
            if (!file_exists($filepath)) {
                throw new Exception('File not found');
            }

            // First, fetch the clip that owns this file
            $query = 'SELECT * FROM ' . $this->table . ' WHERE file_metadata LIKE ?';
            $stmt = $this->conn->prepare($query);
            $searchPattern = '%' . $filename . '%';
            $stmt->bind_param('s', $searchPattern);
            $stmt->execute();
            $result = $stmt->get_result();
            $clip = $result->fetch_assoc();

            if (!$clip || !$clip['file_metadata']) {
                throw new Exception('Unauthorized access to file');
            }

            // Verify the file belongs to this clip
            $fileMetadata = json_decode($clip['file_metadata'], true);
            $fileInfo = null;
            foreach ($fileMetadata as $file) {
                if ($file['stored_name'] === $filename) {
                    $fileInfo = $file;
                    break;
                }
            }

            if (!$fileInfo) {
                throw new Exception('Unauthorized access to file');
            }

            // If it's a view-once clip, delete after download
            if ($clip['is_view_once'] == 1) {
                // Delete file and database entry immediately after sending
                register_shutdown_function(function() use ($filepath, $clip) {
                    if (file_exists($filepath)) {
                        unlink($filepath);
                    }
                    $deleteQuery = 'DELETE FROM clips WHERE url_slug = ?';
                    $stmt = $this->conn->prepare($deleteQuery);
                    $stmt->bind_param('s', $clip['url_slug']);
                    $stmt->execute();
                });
            }
            
            $this->conn->commit();
            return [
                'path' => $filepath,
                'name' => $fileInfo['original_name'],
                'mime' => $fileInfo['mime_type']
            ];
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }
} 