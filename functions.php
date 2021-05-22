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
function doNodeJsRequest(int $port, $paramsArray, $callback): bool
{
    require_once 'vendor/autoload.php';
    $loop   = new React\EventLoop\StreamSelectLoop();
    $dnode  = new DNode\DNode($loop);

    try {
        $dnode->connect($port, function($remote, $connection) use($paramsArray, $callback) {
            $doAfterRequest = function($answerCode, $answer) use($connection, $callback) {
                $callback($answerCode, $answer);
                $connection->end();
            };

            $remote->run(json_encode($paramsArray), $doAfterRequest);
        });

        $loop->run();
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
        if ($status === 'ok') {
            $_SESSION['wallet'] = $generatedWallet;
            header('Refresh: 0');
        }
        else {
            require 'view/error.php';
        }
    };

    doNodeJsRequest(NODE_PORT, ['command' => 'generate-address'], $callback);
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
        $operations[] = [
            'addr'  => ADMIN_ADDRESS,
            'value' => $overallSum - $overallSumWithoutFee - TX_FEE_SAT/SATS_IN_DGB,
            'times' => 1
        ];
    }

    $params = [
        'command'   => 'send-funds', 
        'param'     => [
            'wallet'        => getCurrentGeneratedWallet(),
            'operations'    => $operations,
            'overallSum'    => $overallSum
        ]
    ];

    doNodeJsRequest(NODE_PORT, $params, $callback);
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
