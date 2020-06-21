<?php
define('RUNNING_FROM_APP', true);

require 'config.php';
require 'functions.php';

initApp();

if (DEBUG) {
    $_SESSION['wallet'] = $userDepoWallet = [
        'address'       => 'DBio2nrHAyi8scEo9k4vRxamSvpPhK9TLk', 
        'privateKey'    => 'Kweh2WSK7bvGoQyjrsh6xjZFdum6iLy2mg9wjL3RS3yDf84b35ZP'
    ];
} else {
    $userDepoWallet = getCurrentGeneratedWallet() ?: generateWalletAndRedirect();
}

require 'controller.php';
