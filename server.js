var express = require('express');
var app = express.createServer();
var sar = require('sysstat');


var stats = {},
  init = false;
sar(['-A', '10']).on('stats', function(o){
  if(!init){
    //console.log(Object.keys(o).join(' '));
    init = true;
  }
  stats = o;
});

app.use(express.static(__dirname + '/public'));

app.get('/sysstat', function(req, res){
    res.json(stats);
});

app.listen(3000);

console.log('Server started on http://127.0.0.1:3000');
