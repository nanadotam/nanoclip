<?php
class FileConfig {
    // Maximum number of files per clip
    const MAX_FILES_PER_CLIP = 5;
    
    // Upload directory (absolute path)
    const UPLOAD_DIR = __DIR__ . '/../uploads/';
    
    // Maximum file sizes by type (in bytes)
    const FILE_SIZE_LIMITS = [
        'document' => 25 * 1024 * 1024,  // 25MB
        'image' => 10 * 1024 * 1024,     // 10MB
        'audio' => 50 * 1024 * 1024,     // 50MB
        'video' => 100 * 1024 * 1024,    // 100MB
        'archive' => 50 * 1024 * 1024    // 50MB
    ];

    // Constructor to ensure upload directory exists
    public static function init() {
        $directories = [
            self::UPLOAD_DIR,
            __DIR__ . '/../data/',
            __DIR__ . '/../logs/'
        ];

        foreach ($directories as $dir) {
            if (!file_exists($dir)) {
                if (!mkdir($dir, 0755, true)) {
                    error_log("Failed to create directory: $dir");
                    throw new Exception("Failed to create required directory: $dir");
                }
            }
            
            if (!is_writable($dir)) {
                error_log("Directory not writable: $dir");
                throw new Exception("Directory not writable: $dir");
            }
        }
    }

    // Allowed MIME types by category
    const MIME_TYPE_CATEGORIES = [
        'document' => [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        'image' => [
            'image/jpeg',
            'image/png',
            'image/gif'
        ],
        'video' => [
            'video/mp4',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-ms-wmv'
        ],
        'audio' => [
            'audio/mpeg',
            'audio/wav',
            'audio/x-wav'
        ],
        'archive' => [
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/x-tar',
            'application/x-gzip'
        ]
    ];

    // Additional security checks
    public static function getFileCategory($mimeType) {
        foreach (self::MIME_TYPE_CATEGORIES as $category => $mimeTypes) {
            if (in_array($mimeType, $mimeTypes)) {
                return $category;
            }
        }
        return null;
    }

    public static function getFileSizeLimit($mimeType) {
        $category = self::getFileCategory($mimeType);
        return $category ? self::FILE_SIZE_LIMITS[$category] : 0;
    }

    public static function validateFile($file) {
        // Check if file type is allowed
        $category = self::getFileCategory($file['type']);
        if (!$category) {
            throw new Exception('File type not allowed: ' . $file['type']);
        }

        // Check file size
        $sizeLimit = self::getFileSizeLimit($file['type']);
        if ($file['size'] > $sizeLimit) {
            throw new Exception(
                'File size exceeds limit of ' . 
                ($sizeLimit / 1024 / 1024) . 
                'MB for ' . $category . ' files'
            );
        }

        // Additional security checks
        if (self::hasPhpContent($file['tmp_name'])) {
            throw new Exception('File contains potentially malicious PHP code');
        }

        return true;
    }

    private static function hasPhpContent($filePath) {
        // Get file mime type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        // Only check text-based files for PHP code
        if (strpos($mimeType, 'text/') === 0 || 
            strpos($mimeType, 'application/') === 0) {
            $content = file_get_contents($filePath);
            return (
                stripos($content, '<?php') !== false || 
                stripos($content, '<?=') !== false ||
                stripos($content, '<script') !== false
            );
        }

        return false;  // Non-text files are safe from PHP code injection
    }
} 

// Initialize upload directory
FileConfig::init(); 