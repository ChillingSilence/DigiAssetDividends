let $app = angular.module('dadApp', ['ngAnimate'])

$app.filter('unsafe', ($sce) => $sce.trustAsHtml)

$app.controller('dadController', function($scope, $http, $window, $document) {

    /** Consts */

    const DEFAULT_ADDRESS = 'Ua5zQGwBVVWRRSeKxWbAPbFnxYsEBFMQByTXLP'
    const TAG_GOOGLE_ANALYTICS = ''
    const LABEL = {
        NextBtn: 'Next',
        PrevBtn: 'Prev',
    }
    const ACTIONS = {
        2: 'pageConfirmation',
        3: 'pageDeposit'
    }
    const FEE_PROCENTS = 5


    /** Variables */

    $scope.address      = DEFAULT_ADDRESS
    $scope.page         = 1
    $scope.session      = { userWallet: '' }
    $scope.balance      = 1
    $scope.confirmDetails = ''
    $scope.nextEnabled  = false
    $scope.depoRefreshInterval = null


    /** Inline functions */

    $scope.goStartPage  = () => $scope.changePage(1)
    $scope.goNextPage   = () => $scope.changePage('+1')
    $scope.goPrevPage   = () => $scope.changePage('-1')
    $scope.hasConfirmDetails = () => $scope.confirmDetails != ''
    $scope.getLabel     = (name) => LABEL[name]
    $scope.isValidAddr  = () => $scope.address.length == 38
    $scope.getWallet    = () => $scope.session['userWallet']
    $scope.getFee       = () => $scope.balance * FEE_PROCENTS / 100


    /* Init */

    $scope.init = function() {
        $scope.loadSession()

        if (!$scope.getWallet()) {
            $scope.generateWallet()
        }

        let showUserInterface = function() {
            document.getElementById('loading').remove()
            document.getElementsByTagName('html')[0].classList = []
        }
        showUserInterface()
    }

    $scope.loadSession = function () {
        $scope.session = {}
        $.each(
            $window.sessionStorage, 
            (_, value) => $scope.session.push(angular.fromJson(value))
            )
        console.log($scope.session)
    }

    $scope.generateWallet = function () {

    }

    $scope.changePage = function(page) {
        switch (page) {
            case '+1' : $scope.page ++; break
            case '-1' : $scope.page --; break
            default   : $scope.page = page
        }

        let actionForCurrentPage = ACTIONS[$scope.page]
        if (actionForCurrentPage) {
            eval('$scope.' + actionForCurrentPage + '()')
        }
    }


    /** Page II */

    $scope.pageConfirmation = function() {
        $scope.nextEnabled = false
        $scope.confirmDetails = ''

        let onSuccess = (holdersList) => {
            $scope.nextEnabled = true
            $scope.confirmDetails = '<textarea class="success-info address-info" readonly>'
                + 'Holders count: ' + holdersList.length + '</textarea>'
        }
        let onError = () => {
            $scope.nextEnabled = false
            $scope.confirmDetails = '<textarea class="error-info address-info" readonly>'
                + 'Failed. Check address</textarea>'
        }

        $scope._getAssetInfo(
            $scope.address,
            onSuccess,
            onError
        )
    }

    $scope._getAssetInfo = function(assetId, funcOnSuccess, funcOnFail) {
        var onSuccess = (holders)   => { $scope.$apply(() => funcOnSuccess(holders)) }
        var onError =   ()          => { $scope.$apply(() => funcOnFail()) }

		$.ajax({
			url     : 'https://createdigiassets.com/api/asset-info',
			data    : { id: assetId },
			dataType: 'json',
			success : function(data) {
				let holders = []
                if (data.result && data.result.holders) {
                    holders = data.result.holders
                }

				let holdersCount = holders.length
    			return holdersCount ? onSuccess(holders) : onError()
			},
            error   : function(data) {
                return onError()
            }
		})
    }


    /* Page III */

    $scope.pageDeposit = function() {
        $scope.nextEnabled = false

        $scope._plugQR('#deposit_qr', $scope.getWallet(), null, 320, 1)
        $scope._startDepoRefreshInterval()
    }

    $scope._plugQR = function(selector, address, summ, width, type) {
        jQuery(selector)
            .attr('src', DigiQR.request(address, summ, width, type))
            .css('cursor', 'pointer')
            .on('click', function startDigibyteApp() {
                let url = 'digibyte:' + address
                if (summ) {
                    url += '?amount=' + summ
                }
                window.location = url
            });
    }

    $scope._startDepoRefreshInterval = function() {
        if ($scope.depoRefreshInterval) {
            $scope._stopDepoRefreshInterval()
        }

        $scope.depoRefreshInterval = setInterval(() => $scope._checkBalance(), 10000)
        $scope._checkBalance()
    }

    $scope._stopDepoRefreshInterval = () => clearInterval($scope._depoRefreshInterval)

    $scope._checkBalance = function() {
        console.log('how much?')
        $scope.balance = 100
        $scope.nextEnabled = $scope.balance > 0
    }

})
