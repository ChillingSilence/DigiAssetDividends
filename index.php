<?php
define('RUNNING_FROM_APP', true);

/** @noinspection PhpIncludeInspection */
require 'config.php';
require 'functions.php';

initApp();

if (DEBUG) {
    /** @noinspection SpellCheckingInspection */
    $_SESSION['wallet'] = $userDepositWallet = [
        'address'       => 'DBio2nrHAyi8scEo9k4vRxamSvpPhK9TLk', 
        'privateKey'    => 'Kweh2WSK7bvGoQyjrsh6xjZFdum6iLy2mg9wjL3RS3yDf84b35ZP'
    ];
} else {
    $userDepositWallet = getCurrentGeneratedWallet();
    if (!$userDepositWallet) {
        try {
            generateWalletAndRedirect();
        } catch (Exception $e) {
        }
    }
}

require 'controller.php';
