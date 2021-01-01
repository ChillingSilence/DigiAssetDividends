
const { App }  = require('./app')
const dnode    = require('dnode')

// Start service
var app = new App()
var node = dnode({ 'run': (json, cb) => app.controller(json, cb) })
node.listen(60001)
