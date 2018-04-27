// Dependencies
console.log(": Importing Modules");
const express = require('express');
const request = require("request");
const http = require("http");
const https = require('https');
const fs = require("fs");
const mailHelper = require('./lib/mail_helper');
const socketWrapper = require('./lib/socket_wrapper');

console.log(": Before running this file, make sure the values in settings.json are correct.");

if (!fs.existsSync("settings.json")) {  // if settings.json doesn't exist
  console.log(": Couldn't find settings.json, exiting now!");
  process.exit();
}

// read settings json file synchronously
console.log(": importing settings.json")
var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
var port = settings.live == true ? 443 : 3000;
var emailInfo = settings.email;
emailInfo.from = '"Wick-It Grip" <wickitgrip@gmail.com>';
emailInfo.attachments = null;

console.log(": Setting Up Server!")
var server;

// create express app
var app = express();

if (settings.live) {  // On actual server
  // SSL Info Setup
  console.log(': Reading SSL Setup PEMs')
  var privateKey  = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/privkey.pem');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/fullchain.pem');
  var chain = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/chain.pem');
  var credentials = {key: privateKey, cert: certificate, ca: chain}

  // Set Up HTTP redirect to HTTPS
  console.log(': Creating Express HTTP Server');
  app.use(express.static("public"));
  var httpServer = http.createServer(function (req, res) {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
  }).listen(80);

  // HTTPS Server
  console.log(": Creatting HTTPS Server")
  server = https.createServer(credentials, app).listen(port, function() {
    console.log(': Server is listening on port ' + port);
  });
} else {  // for local development
  // Setup Express
  console.log(": Creating express server");
  app.use(express.static('public'));
  server = http.createServer(app);
  server.listen(port, function() {
    console.log(': Server is listening on port ' + port);
  });
}

// Default page
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

console.log(": importing subscribers")
var subscribers = fs.readFileSync("./data/subscribers.txt").toString().split('\n');

const io = socketWrapper(server, subscribers, mailHelper, emailInfo);
console.log(': index.js end of file reached!!')
