<?php
if (file_exists(__DIR__ . '/../.env')) {
    $envFile = file_get_contents(__DIR__ . '/../.env');
    $lines = explode("\n", $envFile);
    foreach ($lines as $line) {
        if (strlen($line) && strpos($line, '=') !== false) {
            putenv(trim($line));
        }
    }
}
?> 