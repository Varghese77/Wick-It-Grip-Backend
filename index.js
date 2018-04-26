// Dependencies
console.log("Importing Modules");
var express = require('express');
var request = require("request");
var http = require("http");
var https = require('https');
var fs = require("fs");
const nodemailer = require('nodemailer');

console.log("Before running this file, make sure the values in .");
console.log("settings.json are correct.");

if (!fs.existsSync("settings.json")) {  // if settings.json doesn't exist
  console.log("Couldn't find settings.json, exiting now!");

  process.exit();
}

// read settings json file synchronously
var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
var port = settings.live == true ? 443 : 3000;
var server;

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
  server = https.createServer(credentials, app).listen(port, function() {
    console.log('Server is listening on port ' + port);
  });
} else {
  // Setup Express
  console.log("Creating express server");
  app.use(express.static('public'));
  server = http.createServer(app);
  server.listen(port, function() {
    console.log('Server is listening on port ' + port);
  });
}

// socket.io Code!!
const io = require('socket.io')(server);
function onConnection(socket){
  socket.on('subscription', (data) => {
    fs.appendFile("data/subscribers.txt", '\n' + data.message.trim(), (err) => {
      if (err) {
        console.log("subscr error!");
      }
    })
  });

  socket.on('message', (data) => {
    fs.appendFile("data/messages.txt", '\n' + JSON.stringify(data), (err) => {
      if (err) {
        console.log("subscribtion error!");
      }
    })
  });
}
io.on('connection', onConnection);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

console.log('index.js end of file reached!!')
