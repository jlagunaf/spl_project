
var express = require('express');
var app = express();
var fileSystem = require("fs")
var https = require('https');


//Public resources
app.use(express.static('public'));
app.use(express.static('ui'));

//Allow cross-origins
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//GUI for showing trends
app.get('/spl', function (req, res) {
    res.sendfile("indexTrends.html");
});

//GUI for showing trends
app.get('/trends', function (req, res) {
    res.sendfile("indexTrends.html");
});


//Server listening on port 8081
app.listen(8081, function () {
    console.log('SPL Trends App listening on port 8081');
});

