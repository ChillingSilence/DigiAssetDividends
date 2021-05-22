<?php

defined('RUNNING_FROM_APP') || die('Indirect run is not allowed');

/**
 * Make request and pass result as array to function
 *
 * @param int $port
 * @param $paramsArray
 * @param $callback
 * @return bool
 * @throws Exception
 */
function doNodeJsRequest(int $port, $command, $paramsArray, $callback): bool
{
    try {
        $connection = curl_init("http://localhost:$port/$command");
        curl_setopt($connection, CURLOPT_POST, 1);
        curl_setopt($connection, CURLOPT_POSTFIELDS, http_build_query($paramsArray));
        curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);

        $apiResponse = curl_exec($connection);
        $answerCode = curl_getinfo($connection,CURLINFO_HTTP_CODE);
        curl_close($connection);
        $jsonArrayResponse = json_decode($apiResponse, true);

        $callback($answerCode, $jsonArrayResponse);
    }
    catch (RuntimeException $ex) {
        /** @noinspection ForgottenDebugOutputInspection */
        print_r($ex->getMessage());
        return false;
    }

    return true;
}

/**
 * Restore user's address from session
 */
function getCurrentGeneratedWallet(): ?array
{
    return $_SESSION['wallet'] ?? null;
}

/**
 * Generate new address
 * @throws Exception
 */
function generateWalletAndRedirect()
{
    $callback = static function ($status, $generatedWallet) {
        if ($status === 200) {
            $_SESSION['wallet'] = $generatedWallet;
            header('Refresh: 0');
        }
        else {
            require 'view/error.php';
        }
    };

    doNodeJsRequest(NODE_PORT, 'generate-wallet', [], $callback);
}

/**
 * Send funds from user wallets
 *
 * @param array $receiversWithPercents receivers list [['address' => .., 'amountProc' => .., 'times' => ..], ... ]
 * @param float $overallSum sum in DGB
 * @param $callback
 * @throws Exception
 */
function sendFundsFromUserWallet(array $receiversWithPercents, float $overallSum, $callback)
{
    $overallSumWithoutFee = $overallSum * (100 - SYSTEM_FEE_PERCENTS)/100;

    $operations = [];
    foreach ($receiversWithPercents as $receiverInfo) {
        $operations[] = [
            'addr'  => $receiverInfo['address'],
            'value' => $overallSumWithoutFee * (float)$receiverInfo['amountProc'] / 100,
            'times' => 1
        ];
    }

    if (TX_FEE_SAT) {
        $toAdmin = $overallSum * SYSTEM_FEE_PERCENTS / 100 - TX_FEE_SAT/SATS_IN_DGB;
        if ($toAdmin > 0) {
            $operations[] = [
                'addr'  => ADMIN_ADDRESS,
                'value' => $toAdmin,
                'times' => 1
            ];
        }
    }

    $params = getCurrentGeneratedWallet();
    $params['operations'] = $operations;
    $params['overallSum'] = $overallSum;

    doNodeJsRequest(NODE_PORT, 'send-funds', $params, $callback);
}

/**
 * @param array
 */
function jsonOutput($data)
{
    print(json_encode($data));
}

/**
 * Run at the start
 */
function initApp()
{
    session_start();
}
