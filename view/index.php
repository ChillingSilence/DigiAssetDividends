<?php
/**
 * @var $userDepositWallet
 */
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html ng-app="dadApp" class="loading" lang="en">
<head>
    <meta charset="utf-8" content="">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Digibyte Assets Dividends">
    <meta name="author" content="Chilling Silence & Cept">
    <title>DigiAsset Dividends</title>
    <base href="https://digiassetdividends.com" />
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/styles.css">

<?php if (TAG_GOOGLE_ANALYTICS) : ?>
    <script async type="text/javascript" src="...<?= TAG_GOOGLE_ANALYTICS ?>"></script>
    <script type="text/javascript">window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date()); gtag('config', '<?= TAG_GOOGLE_ANALYTICS ?>');</script>
<?php endif ?>
</head>
<body>
<div id="loading">


    <img src="images/giphy.gif"  alt="Please wait..."/>


</div>
<div ng-controller="dadController" ng-init="init()" ng-cloak>

    <header>
        <h1 class="shadow">DigiAsset Dividends</h1>
    </header>

    <div class="container">
        <div class="row">
            <div class="col-12 col-lg-6 offset-lg-3">
                <form>

                    <!-- Progressbar -->
                    <ul id="progressbar">
                        <li ng-class="page >= 1 ? 'active' : ''">Asset ID</li>
                        <li ng-class="page >= 2 ? 'active' : ''">Confirmation</li>
                        <li ng-class="page >= 3 ? 'active' : ''">Deposit DGB</li>
                        <li ng-class="page >= 4 ? 'active' : ''">Payment</li>
                    </ul>

                    <!-- First step -->
                    <fieldset ng-show="page == 1">
                        <h2>Asset ID</h2>

                        <input ng-model="assetAddress" type="text" class="monospace text-center" placeholder="Asset ID" />

                        <p>Enter DigiAsset address, <a href="javascript:" ng-click="setDefaultAddress()">for example</a></p>

                        <button ng-disabled="!isValidAddr()" ng-click="goNextPage()" class="action-button">
                            {{ getLabel('NextBtn') }}
                        </button>
                    </fieldset>

                    <!-- Second step -->
                    <fieldset ng-show="page == 2" class="animate-show-hide" id="confirmation-tab">
                        <h2>Confirmation</h2>

                        <div ng-hide="hasConfirmDetails()">
                            <img src="images/giphy.gif" class="w-50 d-inline align-center rounded"  alt="Please wait..."/>
                        </div>
                        <div ng-show="hasConfirmDetails()">
                            <div ng-bind-html="confirmDetails | unsafe"></div>
                        </div>

                        <button ng-click="goPrevPage()" class="action-button">
                            {{ getLabel('PrevBtn') }}
                        </button>
                        <button ng-click="refreshPage()" ng-show="refreshEnabled" class="action-button">
                            {{ getLabel('RefreshBtn') }}
                        </button>
                        <button ng-disabled="!nextEnabled" ng-click="goNextPage()" class="action-button">
                            {{ getLabel('NextBtn') }}
                        </button>
                    </fieldset>

                    <!-- Third step -->
                    <fieldset ng-show="page == 3" class="animate-show-hide">
                        <h2>Deposit DGB</h2>

                        <div class="mb-3">
                            <div ng-click="urlAction()">
                                <a href="{{ depositExplorerUrl() }}" target="__blank">
                                    <img ng-src="{{depositQRraw}}" width="200px" />
                                    <p>
                                        {{ getUserDepositAddress() }}
                                    </p>
                                </a>
                            </div>
                        </div>

                        <div class="success-info">
                            <p>Deposited: {{ balance }} DGB</p>
                            <p ng-show="getFee()">System fee: {{ getFee() }} DGB</p>
                            <p ng-show="getBalanceMinusFee()">Will be paid: {{ getBalanceMinusFee() }} DGB</p>
                        </div>

                        <button ng-click="goPrevPage()" class="action-button">
                            {{ getLabel('PrevBtn') }}
                        </button>
                        <button ng-click="refreshPage()" ng-show="refreshEnabled" class="action-button">
                            {{ getLabel('RefreshBtn') }}
                        </button>
                        <button ng-click="goNextPage()" ng-show="nextEnabled" class="action-button">
                            {{ getLabel('NextBtn') }}
                        </button>

                        <p>Private key for this address: <small>{{ getUserDepositPrivateKey() }}</small></p>
                        <p>If you know this private key, even if something goes wrong, you will have an access to your deposit.</p>
                    </fieldset>

                    <!-- Fourth step -->
                    <fieldset ng-show="page == 4" class="funky-show-hide">
                        <h2>Payment</h2>

                        <div ng-hide="hasResultDetails()">
                            <img src="images/giphy.gif" class="w-50 d-inline align-center rounded" />
                        </div>
                        <div ng-show="hasResultDetails()">
                            <div ng-if="!resultDetails">
                                <div class="error-info" ng-if="!resultError"><p>Payment failed.</p></div>
                                <div class="error-info" ng-if="resultError"><p>{{resultError}}</p></div>
                                <p>Your deposit private key with funds: <small>{{ getUserDepositPrivateKey() }}</small></p>
                            </div>
                            <div ng-if="resultDetails">
                                <p>Sent amount: {{ getSentAmount() }}</p>

                                <div ng-if="resultDetails['result']">
                                    <a href="https://chainz.cryptoid.info/dgb/tx.dws?{{ resultDetails['result'] }}.htm">Transaction</a>
                                </div>
                            </div>
                        </div>

                        <button ng-click="refreshPage()" ng-show="refreshEnabled" class="action-button">
                            {{ getLabel('RefreshBtn') }}
                        </button>
                        <button ng-click="goStartPage()" ng-disabled="!hasResultDetails()" class="action-button">
                            Repeat again
                        </button>
                    </fieldset>

                </form>
            </div>
        </div>
    </div>


</div>

<script src="js/angular.min.js" type="text/javascript"></script>
<script src="js/angular-animate.min.js" type="text/javascript"></script>
<script src="js/jquery-3.4.1.min.js" type="text/javascript"></script>
<script src="js/bootstrap.min.js" type="text/javascript"></script>
<script src="js/digiQR.min.js" type="text/javascript"></script>
<script type="text/javascript">
    const userDepositAddress = '<?= $userDepositWallet['address'] ?>';
    const userDepositPrivateKey = '<?= $userDepositWallet['privateKey'] ?>';
    console.log(userDepositAddress);
</script>
<script src="js/dadApp.js?" type="text/javascript"></script>

</body>
</html>
