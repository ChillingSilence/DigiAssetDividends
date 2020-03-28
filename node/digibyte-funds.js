/**
 * Open source DGB funds library
 *
 * (c) 2020 by Josiah and Cept
 */


// const { DigiByte }   = require("digibyte")
// const Request    = require("request") // # DERECATED
// const axios 	 = require('axios').default

// const bitcoinjs  = require("bitcoinjs-lib")
const DigiAssets = require('digiassets-sdk')
/* if (!bitcoinjs.bip32) {
    console.log("Error with init BIP32")
    return
}*/


class DGBfunds {

    /**
     * Initialize
     */
    constructor()
    {
        this.explorerUrl = "https://explorer-1.us.digibyteservers.io"
        // Others:    "https://digiexplorer.info"
        //            "https://chainz.cryptoid.info/dgb/api.dws?q=getbalance&a="
        //            "https://insight.digibyte.host"

        this.network = {
            messagePrefix   : '\x19DigiByte Signed Message:\n',
            bip32           : { public: 0x0488B21E, private: 0x0488ADE4 },
            pubKeyHash      : 0x1e,
            scriptHash      : 0x05,
            wif             : 0x80,
            dustThreshold   : 546,
            feePerKb        : 10000,
        }

        this.minFeeToSendDgbs = 1000

        this.marketUrl = "https://api.coinmarketcap.com/v1/ticker"
    }


    /**
     * Generate new DigiByte address
     */
    getNewAddress()
    {
        var wallet      = new DigiByte.PrivateKey();
        return {
            address     : wallet.toLegacyAddress().toString(),
            privateKey  : wallet.toWIF()
        }
    }


    _answerToQuery(error, body, callback=false, modificator=false)
    {
        if (error) { reject(error) }

        let parsedBody = JSON.parse(body)
        switch (modificator) {
            case 'first': parsedBody = parsedBody[0]; break;
        }

        if (callback) {
            callback(parsedBody)
        }

        resolve(parsedBody)
    }


    /**
     * Get the value of current wallet
     */
    getWalletValue(address, cb=false)
    {
        return new Promise((resolve, reject) => {
            let addressInfoUrl = this.explorerUrl + "/api/addr/" + address
            Request.get(addressInfoUrl, (error, response, body) => {
                this._answerToQuery(error, body, cb)
            })
        })
    }


    /**
     * Get the current market information for DGB
     */
    getMarketValue(cb=false)
    {
        return new Promise((resolve, reject) => {
            let digibyteValueUrl = this.marketUrl + "/digibyte/"
            Request.get(digibyteValueUrl, (error, response, body) => {
                this._answerToQuery(error, body, cb, 'first')
            })
        })
    }


    /**
     * Get UXTO of wallet
     */
    _getUnspentTransactionOutput(address, cb=false)
    {
        var thisClass = this
        
        return new Promise((resolve, reject) => {
            let addressUtxosUrl = thisClass.explorerUrl + "/api/addr/" + address + "/utxo"
            Request.get(addressUtxosUrl, (error, response, body) => {
                thisClass._answerToQuery(error, body, cb)
            })
        })
    }


    /**
     * Send tx
     */
    _sendTransaction(transaction, cb=false)
    {
        var thisClass = this

        return new Promise((resolve, reject) => {
            Request.post({
                "headers"   : { "content-type": "application/json" },
                "url"       : thisClass.explorerUrl + "/api/tx/send",
                "body"      : JSON.stringify({ "rawtx" : transaction.serialize() })
            },
            (error, response, body) => {
                thisClass._answerToQuery(error, body, cb)
            });
        });
    }


    _importWIFPrivateKey(privateKey)
    {
        return DigiByte.PrivateKey.fromWIF(privateKey);
    }


    _error(message, cb=false)
    {
        cb('error', message)
        reject(message)
    }


    createAndSendTransaction(sourcePrivateKeyWIF, sourceAddress, dgbs, operations, cb)
    {
        var thisClass = this

        var satoshis = 100000000 * dgbs
        var satoshisLeft = satoshis
        var sourcePrivateKey = this._importWIFPrivateKey(sourcePrivateKeyWIF)

        return new Promise((resolve, reject) => {
            this._getUnspentTransactionOutput(sourceAddress).then(utxos => {

                if (utxos.length == 0) {
                    reject({
                        "result"    : "error",
                        "message"   : "The source address has no unspent transactions" 
                    })
                }

                var changePrivateKey = new DigiByte.PrivateKey()
                var changeAddress = changePrivateKey.toAddress()
                var transaction = new DigiByte.Transaction()
                for (let index = 0; index < utxos.length; index++) {
                    transaction.from(utxos[index])
                }

                for (let index in operations) {

                    let line    = operations[index]
                    let summ    = line['value']
                    let times   = line['times']
                    let addr    = (addr == 'issueAddress') ? sourceAddress : line['addr']

                    if (summ < 0) {
                        summ += satoshisLeft
                        if (summ < 0) {
                            thisClass._error('Negative summ', cb)
                        }

                        times = 1
                    }

                    for (let index = 0; index < times; index ++) {
                        transaction.to(addr, summ)
                        satoshisLeft -= summ

                        if (satoshisLeft < 1000) {
                            thisClass._error('No satoshis left in send-us', cb)
                        }
                    }

                }

                transaction.change(changeAddress)

                transaction.sign(sourcePrivateKey)

                thisClass._sendTransaction(transaction).then(
                    result => {
                        resolve(Object.assign(result, {
                            "source_private_key"    : sourcePrivateKeyWIF,
                            "source_address"        : sourceAddress,
                            "change_private_key"    : changePrivateKey.toWIF(),
                            "change_address"        : changeAddress,
                            "sent_amount"           : satoshis
                        }))

                        cb('ok', 'sent')
                    }, 
                    error => {
                        cb('error', error)
                        reject(error)
                    }
                )

            }, error => {
                cb('error', error)
                reject(error);
            })
        })
    }


    depositToAddress(fromWallet, toAddr, amount, callback)
    {
        var transaction = [{
            'times' : 1,
            'addr'  : toAddr,
            'value' : -this.minFeeToSendDgbs
        }];

        fromWallet.send(transaction, amount, (status, text) => callback(status, text));
    }


    depositToAddressTill(fromWallet, toAddr, needAmount, callback)
    {
        var thisClass = this

        this.getWalletValue(toAddr, function(wallet) {
            if (wallet.balance >= needAmount) {
                return callback('ok', wallet.balance)
            }

            thisClass.depositToAddress(fromWallet, toAddr, needAmount - wallet.balance, callback)
        })

    }


/*    send(outputs, dgbs, callback_func)
    {
        var sourceAddress = this.address
        var sourcePrivateKey = this.privateKey
        var satoshis = 100000000 * dgbs
        var satoshis_left = satoshis

        console.log(outputs);
        console.log(satoshis);
        console.log('on the way');

        return new Promise((resolve, reject) => {

            this.getHDAddress2().then(hdwallet => {

            this.getUnspentTransactionOutput(sourceAddress).then(utxos => {
                if (utxos.length == 0) {
                    var error = "The source address has no unspent transactions"
                    callback_func ('error', JSON.stringify(error));
                    reject({ "message": error });
                }
                console.log('HDWALLET:');
                console.log(hdwallet);

                //var changePrivateKey = new DigiByte.PrivateKey();
                //var changeAddress = changePrivateKey.toAddress();
                var changePrivateKey = sourcePrivateKey;
                var changeAddress = sourceAddress;

                // Input: Use all utxos 
                var transaction = new DigiByte.Transaction();
                for (var i = 0; i < utxos.length; i++) {
                    transaction.from(utxos[i]);
                }

                // Issuer
                var issueAddress = hdwallet;

                // Fill outputs: Fee for create asset, for movement, destination, fee..
                for (var index in outputs) {
                    var tx = outputs[index]

                    // 1st param - times
                    for (var i = 0; i < tx['times']; i ++) {

                        // 2nd param - addr
                        // Some symlinks
                        if (tx['addr'] == 'issueAddress') tx['addr'] = issueAddress;

                        // Add output
                        var summ = tx['value'];
                        if (summ < 0) summ = satoshis_left + summ;
                        console.log('lets also pass ' + tx['addr'] + ' for a ' + summ);
                        transaction.to(tx['addr'], summ);

                        // Satoshis spend
                        satoshis_left -= summ;

                        if (satoshis_left < 1000) {
                            console.log('!!! No satoshis left in send-us');
                            //return;
                        }
                    }
                }

                // Last steps
                //console.log('trying pass ' + changeAddress + ' to ' + destinationAddress + ' via ' +  sourcePrivateKey);
                transaction.change(changeAddress);
                transaction.sign(sourcePrivateKey);

                // Send, complete
                this.sendTransaction(transaction).then(result => {

                    var res = resolve(Object.assign(result, {
                        "source_private_key": sourcePrivateKey,
                        "source_address": sourceAddress,
                        "change_private_key": changePrivateKey,
                        "change_address": changeAddress,
                        //"destination_address": destinationAddress,
                        "sent_amount": satoshis
                    }));

                    callback_func ('ok', JSON.stringify(res));

                }, error => {
                    console.log(error);
                    callback_func ('error', JSON.stringify(error));
                    reject(error);
                    return false;
                });
            }, error => {
                console.log(error);
                reject(error);
                return false;
            });

	    }, error => {
                console.log(error);
                reject(error);
                return false;
	    });
        });
    }*/

}

exports.DGBfunds = DGBfunds;
