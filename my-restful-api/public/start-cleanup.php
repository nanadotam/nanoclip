<?php
require_once __DIR__ . '/../daemon/cleanup-daemon.php';

$daemon = new CleanupDaemon();
$daemon->start(); 