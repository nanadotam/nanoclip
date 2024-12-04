<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    public $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST');
        $this->db_name = getenv('DB_NAME');
        $this->username = getenv('DB_USER');
        $this->password = getenv('DB_PASSWORD');
        $this->port = getenv('DB_PORT');
    }

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new mysqli(
                $this->host, 
                $this->username, 
                $this->password, 
                $this->db_name,
                $this->port
            );
            $this->conn->set_charset("utf8mb4");
            
            if ($this->conn->connect_error) {
                throw new Exception("Connection error: " . $this->conn->connect_error);
            }
            
            return $this->conn;
        } catch(Exception $e) {
            echo "Connection error: " . $e->getMessage();
            return null;
        }
    }
}
?>
