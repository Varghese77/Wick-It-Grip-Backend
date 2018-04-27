// Dependencies
console.log(": Importing Modules");
var express = require('express');
var request = require("request");
var http = require("http");
var https = require('https');
var fs = require("fs");
var mailHelper = require('./lib/mail_helper');

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

var mailHashSet = {
  addEmail: function(email) {
    this[email.toLowerCase()] = true;
  },

  checkEmail: function(email) {
    return this[email.toLowerCase()] == true
  }
}

console.log(": importing subscribers")
fs.readFileSync("./data/subscribers.txt").toString().split('/n').forEach(
  (line) => {
    console.log(":    importing subscriber " + line);
    mailHashSet.addEmail(line.trim());
  }
)

console.log(": Setting Up Server!")
var server;

// create express app
var app = express();

if (settings.live) {
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
} else {
  // Setup Express
  console.log(": Creating express server");
  app.use(express.static('public'));
  server = http.createServer(app);
  server.listen(port, function() {
    console.log(': Server is listening on port ' + port);
  });
}

// socket.io Code!!
const io = require('socket.io')(server);
function onConnection(socket){
  socket.on('subscription', (data) => {
    console.log(": received subscription with data: " + JSON.stringify(data))

    if (data.message == undefined) {
      console.log(": No input email detected!");
      return;
    }
    if (!mailHelper.validateEmail(data.message)) {
      console.log(": invalid email detected!");
      return;
    }
    if (mailHashSet.checkEmail(data.message)) {
      console.log(": This email has already been subscribed!");
      return;
    }

    fs.appendFile("data/subscribers.txt", '\n' + data.message.trim(), (err) => {
      if (err) {
        console.log(": subscr error!");
      }

      console.log(": Sending confirmation email to self!")
      emailInfo.to = 'wickitgrip@gmail.com';
      emailInfo.subject =  'Subscription Update';
      emailInfo.text = data.message.trim() + ' has subscribed!';
      emailInfo.attachments = [{
        filename: 'subscribers.txt',
        path: './data/subscribers.txt'
      }]
      mailHelper.send(emailInfo);
      
      console.log(": Sending confirmation email to user!")
      emailInfo.to = data.message.trim();
      emailInfo.subject =  'Wick-It Grip Subscription Confirmation';
      emailInfo.text = "Hello,\n\nThis email has been subscribed to Wick-It Grip's " +
        "mailing list. For more info go to wickitgrip.com.\n" + 
        "If this was a mistake, please email us back to unsubscribe.\n\n" + 
        "From,\nThe Wick-It Grip Team";
      emailInfo.attachments = null;
      mailHelper.send(emailInfo);
      
      mailHashSet.addEmail(data.message)
      
    })
  });

  socket.on('message', (data) => {
    console.log(": received message with data: " + JSON.stringify(data))

    if (data.email == undefined || data.name == undefined || data.subject == undefined
      || data.message == undefined) {
      console.log(": message data incomplete!")
      return;
    }
    if (!mailHelper.validateEmail(data.email)) {
      console.log(": invalid email detected!");
      return;
    }

    fs.appendFile("data/messages.txt", '\n' + JSON.stringify(data), (err) => {
      if (err) {
        console.log(": messages.txt opening error:" + err);
      }

      console.log(": Sending message email to self!")
      emailInfo.to = 'wickitgrip@gmail.com';
      emailInfo.subject =  "Website MSG: " + data.subject;
      emailInfo.text = "From: " + data.name + "\nEmail: " + data.email + "\nMessage Below\n" + data.message;
      emailInfo.attachments = null;
      mailHelper.send(emailInfo);
    })
  });
}
io.on('connection', onConnection);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

console.log(': index.js end of file reached!!')
