let $app = angular.module('dadApp', ['ngAnimate'])

$app.filter('unsafe', ($sce) => $sce.trustAsHtml)

$app.controller('dadController', function($scope, $http, $window, $document) {

    /** Consts */

    // const DEFAULT_ASSET_ADDR    = 'La31NJknBQUe2JgsnZQneGd6Jm8PLX4L1yBhJC' // Chilling
    const DEFAULT_ASSET_ADDR    = 'Ua5zQGwBVVWRRSeKxWbAPbFnxYsEBFMQByTXLP' 
    const ASSET_INFO_URL        = 'https://api.digiassets.net/v3/assetmetadata/%s'
    const HOLDERS_URL           = 'https://api.digiassets.net/v3/stakeholders/%s'
    const BALANCE_URL           = 'https://explorerapi.digiassets.net/api/getaddressinfowithtransactions?address=%s'
    const EXPLORER_URL		= 'https://digiexplorer.info/address/';
    //                          = 'https://explorer-1.us.digibyteservers.io/api/addr/%s/?noTxList=1'
    const PAYMENT_URL           = '/'

    const LABEL                 = { NextBtn: 'Next', PrevBtn: 'Back', RefreshBtn: 'Refresh' }
    const ACTIONS               = { 2: 'pageConfirmation', 3: 'pageDeposit', 4: 'pageAction' }
    const FEE_PROCENTS          = 5
    const SATS_IN_DGB           = 100000000


    /** Variables */

    $scope.assetAddress         = DEFAULT_ASSET_ADDR
    $scope.page                 = 1
    $scope.balance              = 0
    $scope.refreshEnabled       = false
    $scope.nextEnabled          = false
    $scope.confirmDetails       = ''
    $scope.resultDetails        = ''
    $scope.refreshInterval      = null
    $scope.depositQRraw         = ''
    $scope.depositExplorerUrl	= ''

    /** Inline functions */

    $scope.goStartPage          = () => $scope.changePage(1)
    $scope.goPrevPage           = () => $scope.changePage('-1')
    $scope.refreshPage          = () => $scope.changePage('')
    $scope.goNextPage           = () => $scope.changePage('+1')
    $scope.hasConfirmDetails    = () => $scope.confirmDetails != ''
    $scope.hasResultDetails     = () => $scope.resultDetails != ''
    $scope.isValidAddr          = () => $scope.assetAddress.length == 38
    $scope.getFee               = () => $scope.balance * FEE_PROCENTS / 100
    $scope.getBalanceMinusFee   = () => $scope.balance - $scope.getFee()
    $scope.getLabel             = (name) => LABEL[name]
    $scope.getUserDepoAddress   = () => userDepoAddress


    /* Init */

    $scope.init = function() {
        let showUserInterface = function() {
            document.getElementById('loading').remove()
            document.getElementsByTagName('html')[0].classList = []
        }
        showUserInterface()
    }

    $scope.changePage = function(page) {
        switch (page) {
            case '+1' : $scope.page ++; break
            case '-1' : $scope.page --; break
            case ''   : break
            default   : $scope.page = page
        }

        $scope._stopRefreshInterval()
        $scope.refreshEnabled = false

        let actionForCurrentPage = ACTIONS[$scope.page]
        if (actionForCurrentPage) {
            eval('$scope.' + actionForCurrentPage + '()')
        }
    }


    /** Page I */


    /** Page II */

    $scope.pageConfirmation = function() {
        $scope.nextEnabled = false
        $scope.confirmDetails = ''

        let onSuccess = (assetInfo) => {
            $scope.nextEnabled = true
            $scope.confirmDetails = 
                '<div class="success-info">'
                + '<p>Asset ID: <b>'        + assetInfo.assetId             + "</b></p>"
                + '<p>Holders count: <b>'   + assetInfo.numOfHolders        + "</b></p>"
                + '<p>Total supply: '       + assetInfo.totalSupply         + "</p>"
                + '<p>Aggregation policy: ' + assetInfo.aggregationPolicy   + "</p>"
                + '<p>Locked: '             + assetInfo.lockStatus          + "</p>"
                + '</div>'
            $scope.balance = 0
            $scope.$apply()
        }

        let onError = function() {
            $scope.nextEnabled = false
            $scope.refreshEnabled = true
            $scope.confirmDetails = '<div class="error-info"><p>Failed. Check address or retry</p></div>'
            $scope.$apply()
        }

        $scope._getAssetInfo(
            $scope.assetAddress,
            onSuccess,
            onError
        )
    }

    $scope._getAssetInfo = function(assetAddress, funcOnSuccess, funcOnError) {
        let onSuccess   = (info) => { funcOnSuccess(info) }

		$.ajax({
			url     : ASSET_INFO_URL.replace('%s', assetAddress),
			dataType: 'json',
			success : (response) => { response.assetId ? onSuccess(response) : funcOnError() },
            error   : funcOnError
		})
    }


    /* Page III */

    $scope.pageDeposit = function() {
        $scope.nextEnabled = false
	$scope.depositExplorerUrl = EXPLORER_URL + userDepoAddress
        $scope.depositQRraw = DigiQR.request(userDepoAddress, 0, 340, 5)
        $scope._startDepoRefreshInterval()
    }

    $scope._startDepoRefreshInterval = function() {
        $scope._refreshInterval = setInterval($scope._checkBalance, 10000)
        $scope._checkBalance()
    }

    $scope._stopRefreshInterval = function() {
        if ($scope._refreshInterval) {
            clearInterval($scope._refreshInterval)
        }
    }

    $scope._checkBalance = function(callback) {
        if (!userDepoAddress) {
            return
        }

        $scope.nextEnabled = false

		$.ajax({
			url     : BALANCE_URL.replace('%s', userDepoAddress),
			dataType: 'json',
			success : (response) => {
                $scope.balance = response.balance / SATS_IN_DGB

                if (response.balance) {
                    $scope.nextEnabled = $scope.balance > 0
                }

                $scope.$apply()

                if (callback) {
                    callback()
                }
            }
		})
    }


    /* Page IV */

    $scope.pageAction = function() {
        $scope.resultDetails = ''

        let onPaymentSuccess = (info) => {
            $scope.resultDetails = '<div class="success-info">' + info + '</div>'
            $scope.refreshEnabled = false
            $scope.$apply()
        }
        let onError = onPaymentError = () => {
            $scope.resultDetails = '<div class="error-info"><p>Payment failed.</p></div>'
            $scope.refreshEnabled = true
            $scope.$apply()
        }

        $scope._getHoldersInfo(
            $scope.assetAddress, 
            (holdersInfo) => {
                $scope._postPayment(
                    $scope._getReceiversListByHoldersInfo(holdersInfo),
                    onPaymentSuccess,
                    onPaymentError
                )
            },
            onError
        );
    }

    $scope._getHoldersInfo = function(address, funcOnSuccess, funcOnError) {
		$.ajax({
			url     : HOLDERS_URL.replace('%s', address),
			dataType: 'json',
			success : (response) => { funcOnSuccess(response) },
            error   : funcOnError
		})
    }

    $scope._getReceiversListByHoldersInfo = function(holdersInfo) {
        let overallAmount = 0
        holdersInfo.holders.forEach((holder) => {
            overallAmount += parseFloat(holder.amount)
        })

        let receiversList = []
        holdersInfo.holders.forEach((holder) => {
            let amountProc = parseFloat(holder.amount) / overallAmount * 100
            receiversList.push({
                'address'   : holder.address,
                'amountProc': amountProc
            });
        })

        return receiversList
    }

    $scope._postPayment = (receiversInProcents, funcOnSuccess, funcOnError) => {
        let userWalletBalance = $scope.balance
        if (!userWalletBalance) {
            return funcOnError()
        }

        $.post({
            url     : PAYMENT_URL,
            data    : {
                'action'                : 'send-funds',
                'overallSumm'           : userWalletBalance,
                'receiversInProcents'   : receiversInProcents
            },
            success : (response) => { funcOnSuccess(response) },
            error   : funcOnError
        })
    }

})
