# DigiAssetDividends
Pay your DigiAsset holders dividends in DigiByte

Simply enter the DigiAsset ID, and you will be given a confirmation screen to ensure you are looking at the right DigiAsset information

Enter how many DigiByte you want to distribute to your DigiAsset holders, and the website will automatically calculate the amount of $DGB that each holder will receive respectively, as well as Tx-costs to distribute the funds to the holders

Simple! :)


Requirements
============
* GMP PHP extension is required (most shared hostings don't have it, another reason to implement digibyted support)
* By default, it will only allow 1 user by IP to **try** login at the same time (once a user is logged, another user could start the login process), this example could be modify to allow several (no need to modify DigiID)


Notes
=====
Based on the [digibyte/digiid-php](https://github.com/digibyte/digiid-php), which based on the work of [scintill/php-bitcoin-signature-routines](https://github.com/scintill/php-bitcoin-signature-routines) and using [PHPECC classes](https://github.com/mdanter/phpecc)
Licensed under the Apache License, Version 2.0 (unless it's not compatible with the license of works used)

**DigiByte Authentication Open Protocol**
Pure DigiByte sites and applications shouldn't have to rely on artificial identification methods such as usernames and passwords. DigiID is an open protocol allowing simple and secure authentication using public-key cryptography.
Classical password authentication is an insecure process that could be solved with public key cryptography. The problem however is that it theoretically offloads a lot of complexity and responsibility on the user. Managing private keys securely is complex. However this complexity is already being addressed in the Bitcoin ecosystem. So doing public key authentication is practically a free lunch to digibyters.

**The protocol is described on the following BIP draft and is open for discussion:**
https://github.com/bitid/bitid/blob/master/BIP_draft.md


License
=======
The MIT License (MIT)

Copyright (c) 2018-2019 Sergey Taranov
Copyright (c) 2016 Daniel Esteban

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
