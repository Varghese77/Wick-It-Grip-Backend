module.exports = function(server, subscribers, mailHelper, emailInfo) {
  // HashSet to store all the emails that have already subscribed
  const mailHashSet = {
    addEmail: function(email) {
      this[email.toLowerCase()] = true;
    },

    checkEmail: function(email) {
      return this[email.toLowerCase()] == true
    }
  } 

  for(idx in subscribers) {
    console.log(":    importing subscriber " + subscribers[idx]);
    mailHashSet.addEmail(subscribers[idx].trim());
  }

  // socket.io Code!!
  const io = require('socket.io')(server);
  function onConnection(socket){

    // Received new email address wanting to subscribe
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
        //mailHelper.send(emailInfo);

        console.log(": Sending confirmation email to user!")
        emailInfo.to = data.message.trim();
        emailInfo.subject =  'Wick-It Grip Subscription Confirmation';
        emailInfo.text = "Hello,\n\nThis email has been subscribed to Wick-It Grip's " +
          "mailing list. For more info go to wickitgrip.com.\n" +
          "If this was a mistake, please email us back to unsubscribe.\n\n" +
          "From,\nThe Wick-It Grip Team";
        emailInfo.attachments = null;
        //mailHelper.send(emailInfo);

        mailHashSet.addEmail(data.message)

      })
    });

    // Received new message from website
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
        emailInfo.text = data.message;
        emailInfo.attachments = null;
        // mailHelper.send(emailInfo);
      })
    });
  }
  io.on('connection', onConnection);

  return io;
}
