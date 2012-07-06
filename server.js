var express = require('express');
var app = express.createServer();
var sar = require('sysstat');

var stats = {};
sar(['-A', '10']).on('stats', function(o){
  stats = o;
});

app.use(express.static(__dirname + '/public'));

app.get('/sysstat', function(req, res){
    res.json(stats);
});

app.listen(3000);
