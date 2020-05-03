<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html ng-app="dadApp" class="loading">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Digibyte Assets Dividends">
    <meta name="author" content="Chilling Silence & Cept">
    <title>DigiAsset Dividends</title>
    <base href="https://digiassetdividends.com" />
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/styles.css">

    <script src="js/angular.min.js"></script>
    <script src="js/angular-animate.min.js"></script>

<?php if (TAG_GOOGLE_ANALYTICS) : ?>
    <script async src="...<?= TAG_GOOGLE_ANALYTICS ?>"></script>
    <script >window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date()); gtag('config', '<?= TAG_GOOGLE_ANALYTICS ?>');</script>
<?php endif ?>
</head>
<body>
<div id="loading">


    <img src="images/giphy.gif" />


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
                        <li ng-class="page >= 4 ? 'active' : ''">Result</li>
                    </ul>

                    <!-- First step -->
                    <fieldset ng-show="page == 1">
                        <h2>Asset ID</h2>

                        <input ng-model="assetAddress" type="text" class="monospace text-center" placeholder="Asset ID" />

                        <button ng-disabled="!isValidAddr()" ng-click="goNextPage()" class="action-button">
                            {{ getLabel('NextBtn') }}
                        </button>
                    </fieldset>

                    <!-- Second step -->
                    <fieldset ng-show="page == 2" class="animate-show-hide">
                        <h2>Confirmation</h2>

                        <div ng-hide="hasConfirmDetails()">
                            <img src="images/giphy.gif" class="w-50 d-inline align-center rounded" />
                        </div>
                        <div ng-show="hasConfirmDetails()">
                            <div ng-bind-html="confirmDetails | unsafe"></div>
                        </div>

                        <button ng-click="goPrevPage()" class="action-button">
                            {{ getLabel('PrevBtn') }}
                        </button>
                        <button ng-click="refreshPage()" ng-disabled="!refreshEnabled" class="action-button">
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
                                <img ng-src="{{depositQRraw}}" width="240px" />
                                <p>{{ getUserDepoAddress() }}</p>
                            </div>
                        </div>

                        <div class="success-info">
                            <p>Balance: {{ balance }} DGB</p>
                            <p ng-show="getFee()">System fee: {{ getFee() }} DGB</p>
                            <p ng-show="getFee()">Will be payed: {{ getBalanceMinusFee() }} DGB</p>
                        </div>

                        <button ng-click="goPrevPage()" class="action-button">
                            {{ getLabel('PrevBtn') }}
                        </button>
                        <button ng-click="refreshPage()" ng-disabled="!refreshEnabled" class="action-button">
                            {{ getLabel('RefreshBtn') }}
                        </button>
                        <button ng-disabled="!nextEnabled" ng-click="goNextPage()" class="action-button">
                            {{ getLabel('NextBtn') }}
                        </button>
                    </fieldset>

                    <!-- Fourth step -->
                    <fieldset ng-show="page == 4" class="funky-show-hide">
                        <h2>Result</h2>

                        <div ng-hide="hasResultDetails()">
                            <img src="images/giphy.gif" class="w-50 d-inline align-center rounded" />
                        </div>
                        <div ng-show="hasResultDetails()">
                            <div ng-bind-html="resultDetails | unsafe"></div>
                        </div>

                        <button ng-click="refreshPage()" ng-disabled="!refreshEnabled" class="action-button">
                            {{ getLabel('RefreshBtn') }}
                        </button>
                        <button ng-click="goStartPage()" ng-show="hasResultDetails()" class="action-button">
                            Repeat again?
                        </button>
                    </fieldset>

                </form>
            </div>
        </div>
    </div>


</div>

<script src="js/jquery-3.4.1.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/digiQR.min.js"></script>
<script>var userDepoAddress = '<?= $userDepoWallet['address'] ?>'; console.log(userDepoAddress);</script>
<script src="js/dadApp.js"></script>

</body>
</html>