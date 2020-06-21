<?php
defined('RUNNING_FROM_APP') || die('Indirect run is not allowed');

// If we have posted data
if ($_POST) {
    switch($_POST['action'] ?? '') {
        case 'send-funds':
            require 'action/send-funds.php'; break;
        default:
            require 'action/not-found.php';
    }
} elseif ($userDepoWallet ?? false) {
    // Show mainpage after wallet was generated
    require 'view/index.php';
}
