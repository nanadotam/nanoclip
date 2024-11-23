<?php
class Clip {
    private $conn;
    private $table = 'clips';

    public $clip_id;
    public $url_slug;
    public $content_type;
    public $text_content;
    public $file_url;
    public $file_metadata;
    public $password_hash;
    public $created_at;
    public $expires_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read_single() {
        $query = 'SELECT * FROM ' . $this->table . ' 
                 WHERE url_slug = ? 
                 AND (expires_at IS NULL OR expires_at > NOW())';
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $this->url_slug);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $clip = $result->fetch_assoc();

        // Hide password hash in response
        if ($clip) {
            $clip['is_protected'] = !empty($clip['password_hash']);
            unset($clip['password_hash']);
        }
        
        return $clip;
    }

    public function create() {
        $query = 'INSERT INTO ' . $this->table . ' 
            (url_slug, content_type, text_content, file_url, file_metadata, password_hash, expires_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)';

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('sssssss', 
            $this->url_slug,
            $this->content_type,
            $this->text_content,
            $this->file_url,
            $this->file_metadata,
            $this->password_hash,
            $this->expires_at
        );

        return $stmt->execute();
    }

    public function verify_password($url_slug, $password) {
        $query = 'SELECT password_hash FROM ' . $this->table . ' WHERE url_slug = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $url_slug);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $clip = $result->fetch_assoc();

        if (!$clip || !$clip['password_hash']) {
            return false;
        }

        return password_verify($password, $clip['password_hash']);
    }
} 