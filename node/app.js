"use strict";


const { DGBfunds }  = require('./digibyte-funds')


class App
{
    constructor()
    {
        this.actions = {
            'generate-address'  : this.actionGenerateAddress,
            'send-funds'        : this.actionSendFunds,
            'test-connect'      : this.actionTest
        }

        this.DGB = new DGBfunds()
    }


    controller(jsonString, callback)
    {
        let json = JSON.parse(jsonString)
        this.cmd = json.command
        this.param = json.param

        this.log('Run command: ' + this.cmd + (this.param) ? ' (Param: ' + this.param + ')' : '')

        if (!(this.cmd in this.actions)) {
            return callback('error', 'Unknown command')
        }

        let action = this.actions[this.cmd].bind(this)
        return action(callback)
    }


    actionGenerateAddress(callback)
    {
        let newAddressInfo = this.DGB.getNewAddress()
        this.log('Generated address', newAddressInfo)

        return callback('ok', newAddressInfo)
    }


    actionSendFunds(callback)
    {
        let params = this.param
        if (!params) {
            return callback('error', 'error in parameters')
        }

        console.log('HEY')
        console.log(params)

        this.DGB.send(
            params.wallet['privateKey'],
            params.wallet['address'],
            params.overallSum,
            params.receivers,
            callback
        )
    }


    actionTest(callback)
    {
        return callback('ok', 'test')
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

exports.App = App
