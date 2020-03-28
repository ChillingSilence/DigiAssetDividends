"use strict";


const { DGBfunds }  = require('./digibyte-funds')
const digibytejs    = require('./digibyte')
const DigiAssets    = require('digiassets-sdk')
const dnode         = require('dnode')
const usePort       = 11111


class App {

    constructor()
    {
        this.admin_address = 'DEbc2Su1jqVavbjAaqP1wXFo15fHY7dbuJ'

        this.actions = {
            'generate-address'  : this.actionGenerateAddress,
            'send-funds'        : this.actionSendFunds,
            'asset-info'        : this.getAssetInfo,
        }

        this.DGB = new DGBfunds()

        // Clear state
        this.status      = ''
        this.result      = {}
        this.completed   = 0
        this.overall     = 1
        this.finish      = false
    }


    run(jsonString, callback)
    {
        var json    = JSON.parse(jsonString)
        this.cmd    = json.command
        this.param  = json.param

        if (this.cmd in this.actions) {
            this.log('Run command: ' + this.cmd + " (Param: " + this.param + ")")
            return (this.actions[this.cmd].bind(this))(callback)
        }

        this.log('Unknown command ' + this.cmd)
        return false
    }


    actionGenerateAddress()
    {
        let newAddressInfo = this.DGB.getNewAddress()
        this.log('Generated address', newAddressInfo)

        return newAddressInfo
    }


    send(fromPriv, fromAddr, summ, deals, callback)
    {
        return this.DGB.createAndSendTransaction(fromPriv, fromAddr, summ, deals, callback)
    }


    assetInfo(callback)
    {
        let address = this.param
        if (!address) {
            callback('error', 'wrong param')
            return
        }

        var da = new DigiAssets(this.secret_settings_issue)
        da.on('connect', function() {
            da.getStakeHolders(address, function (err, result) {
                let status = err ? 'error' : 'ok'
                callback (status, result)
            })
        })
        da.init()
    }


    log(info1, info2=null)
    {
        console.log('----------------------------')
        if (info2) {
            console.log(info1, info2)
        }
        else {
            console.log(info1)
        }
    }


    noCallback(_,__)
    {
        return true
    }


    checkIt(callback)
    {
        callback('ok', '')
    }


}


// Start service on port
var app = new App();
var params = { 'run': (json, cb) => app.run(json, cb) }

dnode(params).listen(usePort);
