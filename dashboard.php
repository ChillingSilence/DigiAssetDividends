<?php
/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

session_start();
require_once dirname(__FILE__) . "/config.php";

// No user logged in
if (empty($_SESSION['user']['address'])
  || empty($_SESSION['user']['info'])) {
    header ('location:' . DIGIID_SERVER_URL);
    exit;
  }

$address = $_SESSION['user']['address'];
$user_info = $_SESSION['user']['info'];
$text = [
  'next' => 'Next step',
  'prev' => 'Previous step',
];

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>DigiAsset Dividends</title>

    <!-- Base address -->
    <base href="<?= DIGIID_SERVER_URL ?>" />

    <!-- Favicon -->
    <link rel="shortcut icon" type="image/x-icon" href="images/favicon.ico">

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

    <!-- Custom styles for this template -->
    <link rel="stylesheet" href="css/dashboard.css">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
<?php if (DIGIID_GOOGLE_ANALYTICS_TAG != '') : ?>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= DIGIID_GOOGLE_ANALYTICS_TAG ?>"></script>
    <script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date()); gtag('config', '<?= DIGIID_GOOGLE_ANALYTICS_TAG ?>');</script>
<?php endif ?>
  </head>
<body>


<div class="container">
  <div class="row">


    <div class="col-12 col-lg-6 offset-lg-3">
      <h1 class="text-center mt-4 text-white shadow">DigiAsset Dividends</h1>
      <p class="text-center mb-2 text-white shadow">Payment from <?= $user_info['fio'] ?></p>

      <!-- At the bottom -->
      <div class="nav">
        <a href="logout.php">Cancel & Logout</a>
      </div>

      <!-- Form -->
      <form id="msform">
        <!-- Progressbar -->
        <ul id="progressbar">
          <li class="active"><span class="shadow">Asset ID</span></li>
          <li><span class="shadow">Confirmation</span></li>
          <li><span class="shadow">Deposit</span></li>
          <li><span class="shadow">Result</span></li>
        </ul>
        <!-- fieldsets -->
        <fieldset>
          <h2 class="fs-title">DigiAsset ID</h2>
          <h3 class="fs-subtitle">Specify to find holders</h3>
          <input type="text" name="asset-id" class="address" placeholder="Asset ID" 
            value="Ua5zQGwBVVWRRSeKxWbAPbFnxYsEBFMQByTXLP" 
            onchange="javascript: check_field(this)" 
            onkeyup="javascript: check_field(this)" />
          <input type="button" name="next" class="next action-button" disabled="disabled" value="<?= $text['next'] ?>" />
        </fieldset>
        <fieldset>
          <h2 class="fs-title">Confirmation</h2>
          <h3 class="fs-subtitle">Details for: <span name="asset-id-short" class="address"></span></h3>
          <div name="details"></div>
          <input type="button" name="previous" class="previous action-button-previous" value="<?= $text['prev'] ?>"/>
          <input type="button" name="next" class="next action-button" value="<?= $text['next'] ?>" />
        </fieldset>
        <fieldset>
          <h2 class="fs-title">Deposit</h2>
          
          <input type="number" name="amount" class="w-25 address mr-1" value=""
            placeholder="Amount DGBs to distribute"
            onchange="javascript: amount_changed(this)" /> DGBs

          <p>Send <span id="amount"></span> DGBs to this address:</p>
          <div class="mb-3"><img width="160px" id="deposit_qr" src="https://www.mobilefish.com/images/services/qrcode_example_1.png" /></div>

          <input type="button" name="previous" class="previous action-button-previous" value="<?= $text['prev'] ?>"/>
          <input type="button" name="next" class="next action-button" value="<?= $text['next'] ?>" />
        </fieldset>
        <fieldset>
          <h2 class="fs-title">Result</h2>
          <h3 class="fs-subtitle">Some congratulations here</h3>
          <ul>
            <li><a href="/dashboard.php">Repeat again?</a></li>
            <li><a href="/logout.php">Logout</a></li>
          </ul>
        </fieldset>
      </form>
    </div>


  </div>
</div>
<!-- /.MultiStep Form -->


<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
<script src="/js/dashboard.js"></script>

</body>
</html>