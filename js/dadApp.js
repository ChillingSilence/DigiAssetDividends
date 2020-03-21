let app = angular.module('dadApp', ['ngAnimate'])

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; })

app.controller('dadController', function($scope) {

    $scope.defaultAddress = 'Ua5zQGwBVVWRRSeKxWbAPbFnxYsEBFMQByTXLP'
    $scope.labelNextBtn   = 'Next'
    $scope.labelPrevBtn   = 'Prev'
    $scope.labelStartBtn  = 'Again'
    $scope.tagGoogleAnalytics = ''


    $scope.details        = ''
    $scope.page           = 1
    $scope.address        = $scope.defaultAddress


    $scope.hasDetails = function() {
        return $scope.details != ''
    }

    $scope.goNextPage = function() {
        $scope.page ++
        $scope.onPageChange()
    }

    $scope.goPrevPage = function() {
        $scope.page --
        $scope.onPageChange()
    }

    $scope.goStartPage = function() {
        $scope.page = 1
        $scope.onPageChange()
    }

    $scope.onPageChange = function() {
        if ($scope.page == 2) {
            $scope.details = ''

            $scope.getAssetInfo(
                $scope.address,
                (holdersList) => { // funcOnSuccess
                    $scope.details = '<span class="success-info">Holders count: ' + holdersList.length + '</span>'
                    },
                () => { // funcOnFail
                    $scope.details = '<span class="error-info">Failed. Check address</span>'
                    }
            )
        }
    }

    $scope.getAssetInfo = function(assetId, funcOnSuccess, funcOnFail) {
        var endError = () => { $scope.$apply(() => { funcOnFail() }) }
        var endSuccess = (holders) => { $scope.$apply(() => { funcOnSuccess(holders) }) }

		$.ajax({
			url     : "https://createdigiassets.com/api/asset-info",
			data    : { id: assetId },
			dataType: 'json',
			success : function(data) {
				let holders = []
                if (data.result && data.result.holders) {
                    holders = data.result.holders
                }

				let holdersCount = holders.length
    			return !holdersCount ? endError() : endSuccess(holders)
			},
            error   : function(data) {
                return endError()
            }
		})
    }

    $scope.isCorrectAddress = function() {
        return $scope.address.length == 38
    }

    $scope.init = function() {
        document.getElementById('loading').remove()
        document.getElementsByTagName('html')[0].classList = []
    }

})
