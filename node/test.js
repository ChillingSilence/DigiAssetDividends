
const { App }  = require('./app')
const dnode    = require('dnode')

// Start service
var app = new App()

// Generate address and output
app.actionGenerateAddress(console.log)
