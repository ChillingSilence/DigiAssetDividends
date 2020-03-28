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
            'asset-info'        : this.actionAssetInfo,
            'test-it'           : this.actionTest,
        }

        this.DGB = new DGBfunds()

        // Clear state
        this.status      = ''
        this.result      = {}
        this.completed   = 0
        this.overall     = 1
        this.finish      = false
    }


    controller(jsonString, callback)
    {
        let json    = JSON.parse(jsonString)

        this.cmd    = json.command
        this.param  = json.param
        if (this.cmd in this.actions) {
            this.log('Run command: ' + this.cmd + " (Param: " + this.param + ")")
            return (this.actions[this.cmd].bind(this))(callback)
        }
        this.log('Unknown command ' + this.cmd)

        callback ('error', 'Unknown command')
        return false
    }


    actionGenerateAddress(callback)
    {
        let newAddressInfo = this.DGB.getNewAddress()
        this.log('Generated address', newAddressInfo)

        callback('ok', newAddressInfo)
    }


    actionSendFunds(callback)
    {
        // this.DGB.createAndSendTransaction(fromPriv, fromAddr, summ, deals, callback)
        this.log('Send funds', this.param)

        callback('error', 'will be implemented later')
    }


    actionAssetInfo(callback)
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


    actionTest(callback)
    {
        callback('ok', 'test')
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
}


// Start service on port
var app = new App()
var node = dnode({ 'run': (json, cb) => app.controller(json, cb) })
node.listen(usePort)
