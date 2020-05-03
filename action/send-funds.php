<?php
defined('RUNNING_FROM_APP') || die('Indirect run is not allowed');

$functionOutput = function($status, $result) {
    jsonOutput([
        'status' => $status,
        'result' => $result
        ]);
};

$requiredParams = ['receiversInProcents', 'overallSumm'];
foreach ($requiredParams as $param) {
    $$param = $_POST[$param] ?? false;
    if (!$$param) {
        return $functionOutput('error', 'Wrong request');
    }
}

sendFundsFromUserWallet($receiversInProcents, $overallSumm, $functionOutput);
