<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Clip.php';

$database = new Database();
$db = $database->connect();
$clip = new Clip($db);
$clip->deleteExpiredClips(); 



// TO BE SET UP TO RUN EVERY DAY
// * * * * * php /path/to/your/api/cron/cleanup.php
