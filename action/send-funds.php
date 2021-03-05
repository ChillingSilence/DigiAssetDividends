<?php
defined('RUNNING_FROM_APP') || die('Indirect run is not allowed');

/**
 * @var $receiversInPercents
 * @var $overallSum
 */

$functionOutput = static function ($status, $result) {
    jsonOutput([
        'status' => $status,
        'result' => $result
    ]);
};

$requiredParams = ['receiversInPercents', 'overallSum'];
foreach ($requiredParams as $param) {
    $$param = $_POST[$param] ?? false;
    if (!$$param) {
        return $functionOutput('error', 'Wrong request');
    }
}

try {
    sendFundsFromUserWallet($receiversInPercents, $overallSum, $functionOutput);
} catch (Exception $e) {
    return $functionOutput('error', 'Error on send funds');
}
