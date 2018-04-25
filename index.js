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
  socket.on('ping-test', (data) => console.log(data.message));
  socket.on('message', (data) => {
    console.log("Name: " + data.name);
    console.log("Email: " + data.email);
    console.log("Subject: " + data.subject);
    console.log("Message: " + data.message);
  });
}
io.on('connection', onConnection);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


console.log('index.js end of file reached!!')
