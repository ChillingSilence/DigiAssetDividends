<?php
defined('RUNNING_FROM_APP') || die('Indirect run is not allowed');

/**
 * Make request and pass result as array to function
 *
 * @param int $port
 * @param array $params
 * @param function after request ends
 */
function doNodeJsRequest($port, $paramsArray, $callback)
{
    require_once 'vendor/autoload.php';
    $loop = new React\EventLoop\StreamSelectLoop();
    $dnode = new DNode\DNode($loop);

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
        print_r($ex);
        return false;
    }

    return true;
}

/**
 * Restore user's address from session
 */
function getCurrentGeneratedWallet()
{
    return $_SESSION['wallet'] ?? false;
}

/**
 * Generate new address
 */
function generateWalletAndRedirect()
{
    $callback = function($status, $generatedWallet) {
        if ($status === 'ok') {
            $_SESSION['wallet'] = $generatedWallet;
            header("Refresh: 0");
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
 * @param array receivers list [['address' => .., 'amountProc' => .., 'times' => ..], ... ]
 * @param float summ in DGB
 * @param function after complete
 */
function sendFundsFromUserWallet($receiversWithProcents, $overallSumm, $callback)
{
    $overallSumm = floatval($overallSumm);
    $overallSummWithoutFee = $overallSumm * (100 - SYSTEM_FEE_PROCENTS)/100;

    $receivers = [];
    foreach ($receiversWithProcents as $receiverInfo) {
        $receivers[] = [
            'addr'  => $receiverInfo['address'],
            'value' => $overallSummWithoutFee * floatval($receiverInfo['amountProc']) / 100,
            'times' => 1
        ];
    }

    if (FEE_PROCENTS) {
        $receivers[] = [
            'addr'  => ADMIN_ADDRESS,
            'value' => $overallSumm - $overallSummWithoutFee - TX_FEE_SAT/SATS_IN_DGB,
            'times' => 1
        ];
    }

    $params = [
        'command'   => 'send-funds', 
        'param'     => [
            'wallet'        => getCurrentGeneratedWallet(),
            'receivers'     => $receivers,
            'overallSumm'   => $overallSumm
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
