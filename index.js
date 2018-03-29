// Dependencies
var express = require('express');
var http = require('http');

// Networking Info
var port = 5000;

// Setup Express
var app = express();
app.use(express.static('public'));
var server = http.createServer(app);
server.listen(port, function(){
  console.log('Server is listening on port ' + port);
});

console.log('index.js EOF reached!')
