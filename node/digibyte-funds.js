/**
 * Open source DGB funds library
 *
 * (c) 2020 by Josiah and Cept
 */


const DigiByte  = require("digibyte")
const Request   = require("request")


class DGBfunds {

    /**
     * Initialize
     */
    constructor()
    {
        this.EXPLORER_URL   = "https://explorer-1.us.digibyteservers.io"
        // this.EXPLORER_URL   = 'http://insight.digibyte.host'

        this.TX_FEE_SAT     = 6000
        this.SATS_IN_DGB    = 100000000
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
        var thisClass = this

        return new Promise((resolve, reject) => {
            this._getUnspentTransactionOutput(sourceAddress).then(utxos => {

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

                let balanceLeft         = overallSumm
                let error               = null

                for (let index = 0; index < utxos.length; index++) {
                    transaction.from(utxos[index])
                }

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
                    if (balanceLeft < thisClass.TX_FEE_SAT / thisClass.SATS_IN_DGB) {
                        error = 'No satoshis left to send'
                        break
                    }

                    // Add transactions
                    let sendSumm = parseInt(summ * thisClass.SATS_IN_DGB)
                    for (let cnt = 1; cnt <= times; cnt ++) {
                        transaction.to(addr, sendSumm)
                    }
                }

                if (error) {
                    cb('error', error)
                    return reject(error)
                }

                transaction.change(changeAddress)

                // TODO: Fix fatal error here: 
                // (node:29343) [DEP0079] DeprecationWarning: Custom inspection function on Objects via .inspect() is deprecated
                // (node:29343) UnhandledPromiseRejectionWarning: Invalid state: Can't retrieve PublicKeyHash from a non-PKH output
                console.log('spk', sourcePrivateKey)
                transaction.sign(sourcePrivateKey)

                thisClass._sendTransaction(transaction).then(
                    result => {
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
        var thisClass = this

        return new Promise((resolve, reject) => {
            let addressUtxosUrl = thisClass.EXPLORER_URL + "/api/addr/" + address + "/utxo"
            Request.get(addressUtxosUrl, (error, response, body) => {
                if (error) {
                    reject(error)
                }

                resolve(thisClass._answerToQuery(body, cb))
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
        var thisClass = this

        return new Promise((resolve, reject) => {
            Request.post({
                "headers"   : { "content-type": "application/json" },
                "url"       : thisClass.EXPLORER_URL + "/api/tx/send",
                "body"      : JSON.stringify({ "rawtx": transaction.serialize() })
            },
            (error, response, body) => {
                if (error) {
                    reject(error)
                }

                resolve(thisClass._answerToQuery(body, cb))
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
