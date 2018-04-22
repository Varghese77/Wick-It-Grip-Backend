// Dependencies
console.log("Importing Modules");
var express = require('express');
var request = require("request");
var http = require("http");
var https = require('https');
var fs = require("fs");

// Networking Info
var port = 443;

// SSL Info Setup
console.log('Reading SSL Setup PEMs')
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/privkey.pem');
var certificate = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/fullchain.pem');
var chain = fs.readFileSync('/etc/letsencrypt/live/wickitgrip.com/chain.pem');
var credentials = {key: privateKey, cert: certificate, ca: chain}
/*;

// Setup Express
console.log("Creating express server");
var app = express();
app.use(express.static('public'));
var server = https.createServer(app);
server.listen(port, function(){
  console.log('Server is listening on port ' + port);
});
*/
// Set Up HTTP redirect to HTTPS
console.log('Creating Express HTTP Server');
var app = express();
app.use(express.static("public"));
var httpServer = http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

// HTTPS Server
console.log("Creatting HTTPS Server")
var httpsServer = https.createServer(credentials, app).listen(443);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


console.log('index.js EOF reached!')
