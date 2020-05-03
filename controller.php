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
}

// Show mainpage after wallet was generated
elseif ($userDepoWallet ?? false) {
    require 'view/index.php';
}
