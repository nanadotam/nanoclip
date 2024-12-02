I'll help you deploy this project on a live Ubuntu server using XAMPP. Here's a step-by-step guide:

### 1. Server Prerequisites

First, install XAMPP on Ubuntu:

```bash
# Update system
sudo apt update
sudo apt upgrade

# Install XAMPP
wget https://www.apachefriends.org/xampp-files/8.2.4/xampp-linux-x64-8.2.4-0-installer.run
chmod +x xampp-linux-x64-8.2.4-0-installer.run
sudo ./xampp-linux-x64-8.2.4-0-installer.run
```

### 2. Project Structure Setup

Create the project directory in XAMPP's htdocs:

```bash
sudo mkdir /opt/lampp/htdocs/nanoclip
sudo chown -R $USER:$USER /opt/lampp/htdocs/nanoclip
```

### 3. Backend Setup

1. Copy the PHP backend files:
```bash
# Create backend directory
mkdir -p /opt/lampp/htdocs/nanoclip/api

# Copy PHP files
cp -r my-restful-api/* /opt/lampp/htdocs/nanoclip/api/
```

2. Create required directories with proper permissions:
```bash
cd /opt/lampp/htdocs/nanoclip/api
mkdir -p uploads logs data
chmod 755 uploads logs data
```

3. Import the database (referenced from):

```1:68:db/webtech_fall2024_nana_amoako.sql
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 23, 2024 at 04:25 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webtech_fall2024_nana_amoako`
--

-- --------------------------------------------------------

--
-- Table structure for table `clips`
--

CREATE TABLE `clips` (
  `clip_id` int(11) NOT NULL,
  `url_slug` varchar(255) NOT NULL,
  `content_type` enum('text','file','text_file') NOT NULL,
  `text_content` text DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `file_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`file_metadata`)),
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_view_once` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clips`
--
ALTER TABLE `clips`
  ADD PRIMARY KEY (`clip_id`),
  ADD UNIQUE KEY `url_slug` (`url_slug`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clips`
--
ALTER TABLE `clips`
  MODIFY `clip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

```


4. Update the database configuration (referenced from):

```1:28:my-restful-api/config/Database.php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "webtech_fall2024_nana_amoako";
    private $username = "root";
    private $password = "";
    public $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
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

```


Replace with:
```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "webtech_fall2024_nana_amoako";
    private $username = "your_db_username";  // Change this
    private $password = "your_db_password";  // Change this
    public $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
            $this->conn->set_charset("utf8mb4");
            return $this->conn;
        } catch(Exception $e) {
            error_log("Connection error: " . $e->getMessage());
            return null;
        }
    }
}
```

### 4. Frontend Setup

1. Build the Next.js frontend:
```bash
# In your development environment
cd nanoclip
npm install
npm run build
```

2. Update the API configuration (referenced from):

```1:7:app/config/api.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function for clip endpoints
export const ENDPOINTS = {
  clips: `${API_BASE_URL}/clips`,
  download: (filename) => `${API_BASE_URL}/clips?download=1&filename=${filename}`
};
```


Replace with:
```javascript
export const API_BASE_URL = 'https://your-domain.com/api';

export const ENDPOINTS = {
  clips: `${API_BASE_URL}/clips`,
  download: (filename) => `${API_BASE_URL}/clips?download=1&filename=${filename}`
};
```

3. Copy the built frontend:
```bash
cp -r .next/static /opt/lampp/htdocs/nanoclip/static
cp -r public/* /opt/lampp/htdocs/nanoclip/
```

### 5. Apache Configuration

Create a new virtual host configuration:

```apache
# /opt/lampp/etc/extra/httpd-vhosts.conf
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot "/opt/lampp/htdocs/nanoclip"
    
    <Directory "/opt/lampp/htdocs/nanoclip">
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
    </Directory>

    # API Reverse Proxy
    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api
</Directory>
</VirtualHost>
```

### 6. Setup Cleanup Cron Job

Add to system crontab:
```bash
sudo crontab -e
```

Add this line:
```cron
*/5 * * * * /opt/lampp/bin/php /opt/lampp/htdocs/nanoclip/api/cron/cleanup.php
```

### 7. Final Steps

1. Start XAMPP services:
```bash
sudo /opt/lampp/lampp start
```

2. Set proper permissions:
```bash
sudo chown -R daemon:daemon /opt/lampp/htdocs/nanoclip/api/uploads
sudo chown -R daemon:daemon /opt/lampp/htdocs/nanoclip/api/logs
sudo chown -R daemon:daemon /opt/lampp/htdocs/nanoclip/api/data
```

3. Test your installation:
- Frontend: https://your-domain.com
- API: https://your-domain.com/api/clips

Remember to:
- Replace `your-domain.com` with your actual domain
- Update database credentials
- Configure SSL certificates for HTTPS
- Set up proper firewall rules
- Configure error logging
- Regularly backup your database and uploads

For additional security, review the `.htaccess` file (referenced from):

```1:4:my-restful-api/.htaccess
php_value upload_max_filesize 100M
php_value post_max_size 100M
php_value memory_limit 256M
php_value max_execution_time 300 
```


----

what does it mean to build the nextjs project and also i dont have permissions to run a terminal on the server, i is provided by my school and it is an FTP server. additionally, how would i run the API and the frontend,, like how do i get it to work


----
I'll help you deploy this project on a school FTP server without terminal access. Here's a step-by-step guide:

### 1. Build Next.js Project Locally

First, on your local machine:

```bash
cd nanoclip
npm run build
npm run export  # This creates a static version of your site
```

This will create a `/out` directory with static files.

### 2. Modify Next.js Config

Update your next.config.mjs to support static export:

```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://your-school-domain.edu/nanoclip/api/:path*'
      }
    ];
  }
};

export default nextConfig;
```

### 3. File Structure for FTP Upload

Create this structure locally:

```
nanoclip/
├── public_html/          # Frontend (from Next.js /out directory)
│   ├── index.html
│   ├── _next/
│   └── assets/
└── api/                  # PHP Backend
    ├── clips/
    ├── config/
    ├── models/
    ├── uploads/
    ├── logs/
    └── data/
```

### 4. Update Database Configuration

Reference the Database.php configuration:

```1:28:my-restful-api/config/Database.php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "webtech_fall2024_nana_amoako";
    private $username = "root";
    private $password = "";
    public $conn;

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
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

```


Modify it with your school's database credentials:

```php
class Database {
    private $host = "school-database-host";
    private $db_name = "your_assigned_db";
    private $username = "your_db_username";
    private $password = "your_db_password";
    public $conn;
    // ... rest of the code
}
```

### 5. Update API URL Configuration

Reference the API config:

```1:7:app/config/api.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function for clip endpoints
export const ENDPOINTS = {
  clips: `${API_BASE_URL}/clips`,
  download: (filename) => `${API_BASE_URL}/clips?download=1&filename=${filename}`
};
```


Update it to point to your school's domain:

```javascript
export const API_BASE_URL = 'https://your-school-domain.edu/nanoclip/api';
```

### 6. FTP Upload Instructions

1. Using FileZilla or any FTP client:
   - Upload `/public_html` contents to `public_html/nanoclip/` on your school's server
   - Upload `/api` directory to `public_html/nanoclip/api/`

2. Set these permissions via FTP client:
   - `nanoclip/api/uploads`: 755
   - `nanoclip/api/logs`: 755
   - `nanoclip/api/data`: 755

### 7. Create Required Directories

Create a PHP script called `setup.php` and upload it to your api directory:

```php
<?php
$directories = [
    __DIR__ . '/uploads',
    __DIR__ . '/logs',
    __DIR__ . '/data'
];

foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
}

echo "Setup complete!";
```

Visit `https://your-school-domain.edu/nanoclip/api/setup.php` once to create directories.

### 8. Import Database

Reference the SQL schema:

```30:41:db/webtech_fall2024_nana_amoako.sql
CREATE TABLE `clips` (
  `clip_id` int(11) NOT NULL,
  `url_slug` varchar(255) NOT NULL,
  `content_type` enum('text','file','text_file') NOT NULL,
  `text_content` text DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `file_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`file_metadata`)),
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_view_once` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```


Import this through your school's phpMyAdmin or database management tool.

### 9. Access Your Application

- Frontend: `https://your-school-domain.edu/nanoclip`
- API: `https://your-school-domain.edu/nanoclip/api`

### Important Notes:

1. Since you can't run a daemon process, remove these files:

```1:8:my-restful-api/daemon/cleanup-daemon.php
<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Clip.php';

// Set up error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/cleanup-daemon.log');

```


2. Instead, create a simple cleanup script that runs when clips are accessed:

```php
<?php
function cleanupExpiredClips($db) {
    $query = "DELETE FROM clips WHERE expires_at < NOW()";
    $db->query($query);
}
```

Add this to your main API file before processing requests.

3. Make sure your school's server has:
   - PHP 7.4 or higher
   - MySQL/MariaDB
   - Required PHP extensions (mysqli, json)
   - Sufficient storage space for uploads

4. Test file uploads with small files first to verify permissions and storage work correctly.

----

what does converting the code to static files mean? does that mean that all the animations and effects would go?

also, how would i run cron jobs on that server, if i dont have such permissions


-----

Let me explain both aspects:

### Static Files Conversion

Converting to static files doesn't mean losing animations or effects! Here's what it means:

1. **What Stays the Same:**
- All React components
- All animations (Framer Motion)
- All interactivity
- All styling (Tailwind)
- All client-side JavaScript

2. **What Changes:**
- Instead of running a Node.js server, Next.js pre-renders your pages into HTML
- The API calls still work normally
- The only limitation is you can't use server-side features like `getServerSideProps`

Think of it like "pre-baking" your website into HTML/CSS/JS files that can run anywhere, while keeping all the interactive features.

### Handling Cleanup Without Cron

Since you can't use cron jobs on the school server, here are two alternatives:

1. **On-Access Cleanup**
Add this to your main API file:

```php
<?php
// Add at the top of api/clips/index.php
function cleanupExpiredClips($db) {
    $query = "DELETE FROM clips WHERE expires_at < NOW()";
    $db->query($query);
    
    // Also clean up files
    $query = "SELECT file_metadata FROM clips WHERE file_metadata IS NOT NULL";
    $result = $db->query($query);
    while ($row = $result->fetch_assoc()) {
        $metadata = json_decode($row['file_metadata'], true);
        if ($metadata && isset($metadata['path'])) {
            if (file_exists($metadata['path'])) {
                unlink($metadata['path']);
            }
        }
    }
}

// Call it before processing any request
cleanupExpiredClips($db);
```

2. **Client-Triggered Cleanup**
Create a separate cleanup endpoint that gets called periodically by the frontend:

```javascript
// In your frontend api.js
export const triggerCleanup = async () => {
    try {
        await axios.post(`${API_BASE_URL}/cleanup`);
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
};

// In your layout or main component
useEffect(() => {
    const cleanup = setInterval(() => {
        triggerCleanup();
    }, 1000 * 60 * 30); // Every 30 minutes
    
    return () => clearInterval(cleanup);
}, []);
```

Then create the cleanup endpoint:

```php
// api/cleanup/index.php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->connect();
    cleanupExpiredClips($db);
    echo json_encode(['status' => 'success']);
}
```

This way, the cleanup happens either when someone accesses a clip or periodically from the frontend, without needing server-level cron access.

Would you like me to explain any part of this in more detail?

---

yes please

----

I'll break down each part in more detail:

### 1. Static Build Process
When you run `npm run build`, Next.js will:
1. Compile your React components
2. Bundle your JavaScript
3. Create static HTML files
4. Optimize images and assets
5. Generate a `/.next` or `/out` directory

For example, a page like this:
```javascript:app/upload/page.jsx
export default function UploadPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
```

Gets converted into:
- An HTML file with the initial content
- A JavaScript bundle with all the React logic
- CSS files with your styles
- Any static assets (images, etc.)

### 2. Cleanup Solutions in Detail

#### Option 1: On-Access Cleanup
```php:api/clips/index.php
function cleanupExpiredClips($db) {
    // 1. First, get all expired clips
    $expired = $db->query("
        SELECT * FROM clips 
        WHERE expires_at < NOW() 
        OR (is_view_once = 1 AND viewed_at IS NOT NULL)
    ");

    while ($clip = $expired->fetch_assoc()) {
        // 2. Delete associated files
        if ($clip['file_metadata']) {
            $files = json_decode($clip['file_metadata'], true);
            foreach ($files as $file) {
                if (file_exists($file['path'])) {
                    unlink($file['path']);
                }
            }
        }
        
        // 3. Delete the database record
        $db->query("DELETE FROM clips WHERE clip_id = {$clip['clip_id']}");
        
        // 4. Log the cleanup
        error_log("Cleaned up clip: {$clip['clip_id']}");
    }
}

// Call at the start of your API endpoint
try {
    cleanupExpiredClips($db);
} catch (Exception $e) {
    error_log("Cleanup error: " . $e->getMessage());
}
```

#### Option 2: Client-Triggered Cleanup
In your frontend:
```javascript:app/components/Layout.jsx
import { useEffect } from 'react';
import { triggerCleanup } from '@/lib/api/clipService';

export default function Layout({ children }) {
    useEffect(() => {
        // Initial cleanup
        triggerCleanup();
        
        // Set up periodic cleanup
        const cleanupInterval = setInterval(() => {
            triggerCleanup();
        }, 1000 * 60 * 30); // 30 minutes
        
        // Cleanup on component unmount
        return () => clearInterval(cleanupInterval);
    }, []);
    
    return <div>{children}</div>;
}
```

And the corresponding API endpoint:
```php:api/cleanup/index.php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Clip.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $database = new Database();
        $db = $database->connect();
        
        if (!$db) {
            throw new Exception("Database connection failed");
        }
        
        $clip = new Clip($db);
        $result = $clip->cleanupExpiredClips();
        
        echo json_encode([
            'status' => 'success',
            'cleaned' => $result
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}
```

Would you like me to explain any specific part of these implementations in more detail?


I'll break down each part in more detail:

### 1. Static Build Process
When you run `npm run build`, Next.js will:
1. Compile your React components
2. Bundle your JavaScript
3. Create static HTML files
4. Optimize images and assets
5. Generate a `/.next` or `/out` directory

For example, a page like this:
```javascript:app/upload/page.jsx
export default function UploadPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
```

Gets converted into:
- An HTML file with the initial content
- A JavaScript bundle with all the React logic
- CSS files with your styles
- Any static assets (images, etc.)

### 2. Cleanup Solutions in Detail

#### Option 1: On-Access Cleanup
```php:api/clips/index.php
function cleanupExpiredClips($db) {
    // 1. First, get all expired clips
    $expired = $db->query("
        SELECT * FROM clips 
        WHERE expires_at < NOW() 
        OR (is_view_once = 1 AND viewed_at IS NOT NULL)
    ");

    while ($clip = $expired->fetch_assoc()) {
        // 2. Delete associated files
        if ($clip['file_metadata']) {
            $files = json_decode($clip['file_metadata'], true);
            foreach ($files as $file) {
                if (file_exists($file['path'])) {
                    unlink($file['path']);
                }
            }
        }
        
        // 3. Delete the database record
        $db->query("DELETE FROM clips WHERE clip_id = {$clip['clip_id']}");
        
        // 4. Log the cleanup
        error_log("Cleaned up clip: {$clip['clip_id']}");
    }
}

// Call at the start of your API endpoint
try {
    cleanupExpiredClips($db);
} catch (Exception $e) {
    error_log("Cleanup error: " . $e->getMessage());
}
```

#### Option 2: Client-Triggered Cleanup
In your frontend:
```javascript:app/components/Layout.jsx
import { useEffect } from 'react';
import { triggerCleanup } from '@/lib/api/clipService';

export default function Layout({ children }) {
    useEffect(() => {
        // Initial cleanup
        triggerCleanup();
        
        // Set up periodic cleanup
        const cleanupInterval = setInterval(() => {
            triggerCleanup();
        }, 1000 * 60 * 30); // 30 minutes
        
        // Cleanup on component unmount
        return () => clearInterval(cleanupInterval);
    }, []);
    
    return <div>{children}</div>;
}
```

And the corresponding API endpoint:
```php:api/cleanup/index.php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Clip.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $database = new Database();
        $db = $database->connect();
        
        if (!$db) {
            throw new Exception("Database connection failed");
        }
        
        $clip = new Clip($db);
        $result = $clip->cleanupExpiredClips();
        
        echo json_encode([
            'status' => 'success',
            'cleaned' => $result
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}
```

Would you like me to explain any specific part of these implementations in more detail?





---
`Apache/2.4.58 (Ubuntu) Server at 169.239.251.102 Port 3341`
---




Ah, that helps! You're working with Apache on Ubuntu, running on port 3341. This is important information.

Let's modify our approach specifica$$

$$lly for your setup:

### 1. API Configuration
Since you're running on a non-standard port (3341), update your API configuration:

```javascript:app/config/api.js
// Update this to match your server
export const API_BASE_URL = 'http://169.239.251.102:3341/nanoclip/api';

export const ENDPOINTS = {
    clips: `${API_BASE_URL}/clips`,
    download: (filename) => `${API_BASE_URL}/clips?download=1&filename=${filename}`
};
```

### 2. Apache Configuration
Create or update `.htaccess` in your project root:

```apache:nanoclip/.htaccess
# Enable URL rewriting
RewriteEngine On

# If the request is for a real file or directory, serve it directly
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Route API requests to the PHP backend
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# Route all other requests to the frontend index.html
RewriteRule ^(?!api/).*$ index.html [QSA,L]

# Set PHP values
php_value upload_max_filesize 100M
php_value post_max_size 100M
php_value memory_limit 256M
php_value max_execution_time 300
```

### 3. CORS Headers
Since you're on a specific IP and port, update your PHP API headers:

```php:api/index.php
<?php
// Allow requests from your frontend origin
header("Access-Control-Allow-Origin: http://169.239.251.102:3341");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Clip-Password");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### 4. Directory Structure
For an Apache server on port 3341, use this structure:

```
/var/www/html/ (or your web root)
└── nanoclip/
    ├── index.html           # Main frontend entry
    ├── _next/              # Next.js static files
    ├── assets/             # Your static assets
    ├── .htaccess           # Apache configuration
    └── api/                # PHP backend
        ├── index.php       # Main API entry point
        ├── config/         # Configuration files
        ├── models/         # Database models
        ├── uploads/        # File uploads directory
        └── logs/           # Log files directory
```

### 5. Build and Deploy Process

1. Build the frontend locally:
```bash
# In your Next.js project directory
npm run build
```

2. Files to upload to your server:
   - Everything from the `out` directory → `/var/www/html/nanoclip/`
   - All PHP files → `/var/www/html/nanoclip/api/`
   - The `.htaccess` file → `/var/www/html/nanoclip/`

3. Set proper permissions:
```bash
# If you have SSH access, or ask your administrator to set these
chmod 755 /var/www/html/nanoclip/api/uploads
chmod 755 /var/www/html/nanoclip/api/logs
```

Would you like me to:
1. Show you how to test if the server is properly configured?
2. Explain how to troubleshoot common issues with this setup?
3. Help you modify any specific part of the code for this environment?
