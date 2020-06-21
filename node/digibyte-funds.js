/**
 * Open source DGB funds library
 *
 * (c) 2020 by Josiah and Cept
 */


const DigiByte  = require("digibyte")
const Request   = require("request")
const bitcoinjs = require("bitcoinjs-lib")


class DGBfunds {

    /**
     * Initialize
     */
    constructor()
    {
        this.EXPLORER_URL   = "https://explorer-1.us.digibyteservers.io"
        // this.EXPLORER_URL   = 'https://insight.digibyte.host'

        this.TX_FEE_SAT     = 20000
        this.SATS_IN_DGB    = 100000000

        // Legacy
        this.DIGIBYTE_NETWORK = {
            messagePrefix   : '\x19DigiByte Signed Message:\n',
            magixPrefix     : '\x19DigiByte Signed Message:\n',
            bip32           : { public: 0x0488B21E, private: 0x0488ADE4 },
            pubKeyHash      : 0x1e,
            scriptHash      : 0x05,
            wif             : 0x80,
            dustThreshold   : 546,
            feePerKb        : 10000,
        }

        this.DIGIBYTE_p2wpkhInP2sh = {
            baseNetwork     : "digibyte",
            messagePrefix   : '\x19DigiByte Signed Message:\n',
            bech32          : 'dgb',
            bip32           : { public: 0x049d7cb2, private: 0x049d7878 },
            pubKeyHash      : 0x1e,
            scriptHash      : 0x3f,
            wif             : 0x80
        }

        this.DIGIBYTE_p2wpkh = {
            baseNetwork     : "digibyte",
            messagePrefix   : 'x19DigiByte Signed Message:\n',
            bech32          : 'dgb',
            bip32           : { public: 0x04b24746, private: 0x04b2430c },
            pubKeyHash      : 0x1e,
            scriptHash      : 0x3f,
            wif             : 0x80
        }
    }


    /**
     * Generate new DigiByte address
     */
    getNewAddress()
    {
        let wallet      = new DigiByte.PrivateKey()
        return {
            address     : wallet.toLegacyAddress().toString(),
            privateKey  : wallet.toWIF()
        }
    }


    /**
     * Send DGBs to addresses
     *
     * @param sourcePrivateKeyWIF 
     * @param sourceAddress
     * @param overallSumm like 100
     * @param operations [ {addr, times, value}, ... ]
     * @param cb callback function after operation
     */
    send(sourcePrivateKeyWIF, sourceAddress, overallSumm, operations, cb)
    {
        var _this = this

        return new Promise((resolve, reject) => {
console.log('sa', sourceAddress)
            this._getUnspentTransactionOutput(sourceAddress).then(utxos => {
console.log('utxos', utxos)

                if (utxos.length == 0) {
                    reject({
                        "result"    : "error",
                        "message"   : "The source address has no unspent transactions"
                    })
                }

                let changePrivateKey    = new DigiByte.PrivateKey()
                let changeAddress       = changePrivateKey.toAddress()
                let transaction         = new DigiByte.Transaction()
                let sourcePrivateKey    = DigiByte.PrivateKey.fromWIF(sourcePrivateKeyWIF)
                let sourcePublicKey     = sourcePrivateKey
// console.log(sourcePrivateKey)

                var keyPair             = bitcoinjs.ECPair.fromWIF(sourcePrivateKeyWIF, _this.DIGIBYTE_NETWORK)
// console.log('!KP')
// console.log(keyPair)
                // let pkhAddress          = bitcoinjs.payments.p2pkh({ pubkey: keyPair.publicKey, network: _this.DIGIBYTE_p2wpkh })
                // let signAddress = pkhAddress; // sourcePrivateKey; //WIF; //new DigiByte.PrivateKey() // DigiByte.Script.buildPublicKeyHashOut(sourcePrivateKey.toAddress());
                let signAddress         = sourcePrivateKeyWIF // keyPair.privateKey // new DigiByte.PrivateKey(sourcePrivateKeyWIF)

// console.log('!PKH')
// console.log(pkhAddress)
                let balanceLeft         = overallSumm
                let error               = null

                transaction.from(utxos)
                /* for (let index = 0; index < utxos.length; index++) {
                    transaction.from(utxos[index])
console.log('from', utxos[index])
                }*/
                // transaction.from(utxos)

                for (let index in operations) {
                    let line    = operations[index]

                    // Validation of addr, summ, times & justifications
                    let addr    = line['addr']
                    let times   = line['times']
                    let summ    = line['value']

                    if (!addr) {
                        error   = 'Empty address'
                        break
                    }

                    if (summ < 0) {
                        times   = 1
                        summ    += satoshisLeft
                        if (summ < 0) {
                            error = 'Negative summ'
                            break
                        }
                    }

                    if (!times) times = 1

                    // Check is sat is enough to transaction
                    balanceLeft -= summ * times

                    // Add transactions
                    let sendSumm = parseInt(summ * _this.SATS_IN_DGB)
                    for (let cnt = 1; cnt <= times; cnt ++) {
                        transaction.to(addr, sendSumm)
// console.log('to', [addr, sendSumm])
                    }
                }

                console.log('bl:', balanceLeft)
                console.log('?', _this.TX_FEE_SAT / _this.SATS_IN_DGB)
                if (balanceLeft < _this.TX_FEE_SAT / _this.SATS_IN_DGB) {
                    error = 'No satoshis left to send'
                }

                if (error) {
                    cb('error', error)
                    return reject(error)
                }

                transaction.change(changeAddress)

                // TODO: Fix fatal error here: 
                // (node:29343) [DEP0079] DeprecationWarning: Custom inspection function on Objects via .inspect() is deprecated
                // (node:29343) UnhandledPromiseRejectionWarning: Invalid state: Can't retrieve PublicKeyHash from a non-PKH output
                console.log('spk:', sourcePrivateKey)
                console.log('spk2:', sourcePrivateKeyWIF)
                // let signAddress = sourcePrivateKey // new DigiByte.PrivateKey(sourcePrivateKeyWIF) // sourcePrivateKey // new DigiByte.Script(sourcePrivateKey)
                // signAddress = signAddress.getPublicKeyHash()

// var address = sourcePrivateKey.toAddress(); // DigiByte.Address.fromString(sourcePrivateKeyWIF);
// var script = DigiByte.Script.buildPublicKeyHashOut(address);

                // DigiByte.Address(DigiByte.PublicKey.fromWIF(sourcePrivateKeyWIF), 'mainnet')
                console.log('SI');
                console.log(signAddress);
                transaction.sign(signAddress, 0)
                console.log('spkga:', signAddress)

                console.log('we will send it')
                _this._sendTransaction(transaction).then(
                    result => {
                        console.log({
                            "source_private_key"    : sourcePrivateKey.toWIF(),
                            "source_address"        : sourceAddress,
                            "change_private_key"    : changePrivateKey.toWIF(),
                            "change_address"        : changeAddress,
                            "sent_amount"           : overallSumm
                        });

                        resolve(Object.assign(result, {
                            "source_private_key"    : sourcePrivateKey.toWIF(),
                            "source_address"        : sourceAddress,
                            "change_private_key"    : changePrivateKey.toWIF(),
                            "change_address"        : changeAddress,
                            "sent_amount"           : overallSumm
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
                reject(error)
            })
        })
    }


    /**
     * Get UXTO of wallet
     *
     * @param address wallet address
     */
    _getUnspentTransactionOutput(address, cb=false)
    {
        var _this = this

        return new Promise((resolve, reject) => {
            let addressUtxosUrl = _this.EXPLORER_URL + "/api/addr/" + address + "/utxo"
            Request.get(addressUtxosUrl, (error, response, body) => {
                if (error) {
                    console.log('_guto')
                    console.log(error)
                    return reject(error)
                }

                resolve(_this._answerToQuery(body, cb))
            })
        })
    }


    /**
     * Send tx
     *
     * @param transaction transaction to send
     */
    _sendTransaction(transaction, cb=false)
    {
        var _this = this

        return new Promise((resolve, reject) => {
            Request.post({
                "headers"   : { "content-type": "application/json" },
                "url"       : _this.EXPLORER_URL + "/api/tx/send",
                "body"      : JSON.stringify({ "rawtx": transaction.serialize() })
            },
            (error, response, body) => {
                if (error) {
                    reject(error)
                }

                resolve(_this._answerToQuery(body, cb))
            });
        });
    }


    /**
     * Reject or callback with params
     *
     * @param body query response
     * @param error error message
     * @param callback function to run after
     * @param modificator data modificator, if needed
     */
    _answerToQuery(body, callback=false, modificator=false)
    {
        console.log('_atq', body)
        let parsedBody = JSON.parse(body)
        if (modificator === 'first') {
            parsedBody = parsedBody[0]
        }

        if (callback) {
            callback(parsedBody)
        }

        return parsedBody
    }
}

exports.DGBfunds = DGBfunds
