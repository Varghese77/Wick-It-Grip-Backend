// Dependencies
console.log("Importing Modules");
var express = require('express');
var request = require("request");
var http = require("http");
var https = require('https');
var fs = require("fs");

// read settings json file synchronously
var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

// Networking Info
var port = settings.live == true ? 443 : 3000;

// create express app
var app = express();

if (settings.live) {
  // SSL Info Setup
  console.log('Reading SSL Setup PEMs')
  var privateKey  = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/privkey.pem');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/fullchain.pem');
  var chain = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/chain.pem');
  var credentials = {key: privateKey, cert: certificate, ca: chain}

  // Set Up HTTP redirect to HTTPS
  console.log('Creating Express HTTP Server');
  app.use(express.static("public"));
  var httpServer = http.createServer(function (req, res) {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
  }).listen(80);

  // HTTPS Server
  console.log("Creatting HTTPS Server")
  var httpsServer = https.createServer(credentials, app).listen(port, function() {
    console.log('Server is listening on port ' + port);
  });
} else {
  // Setup Express
  console.log("Creating express server");
  app.use(express.static('public'));
  var server = http.createServer(app);
  server.listen(port, function() {
    console.log('Server is listening on port ' + port);
  });
}

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


console.log('index.js end of file reached!!')
