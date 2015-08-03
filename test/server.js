'use strict';

var express = require('express')
var path = require('path')
var app = express()
var colors = require('colors')

/**
 *  static folder
 **/
app.use(express.static(path.join(__dirname, '../')))

app.get('/log', function (req, res) {
	console.log(req.query._t + ' ' + decodeURIComponent(req.query.msg).red)
	res.send('ok')
})

/**
 *  server and port
 **/
var port = process.env.PORT || 1024
app.listen(port, function () {
    console.log('Server is listen on port', String(port).blue)
    
})