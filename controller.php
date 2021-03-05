<?php
defined('RUNNING_FROM_APP') || die('Indirect run is not allowed');

// If we have posted data
if ($_POST) {
    if ($_POST['action'] ?? '' === 'send-funds') {
        require 'action/send-funds.php';
    } else {
        require 'action/not-found.php';
    }
} elseif ($userDepositWallet ?? false) {
    // Show main page after wallet was generated
    require 'view/index.php';
}
