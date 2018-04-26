var socket = io();

var subscribeButton = document.getElementById("ping-button");
subscribeButton.onclick = function() {  // change event if necessary
      // build up dictionary to send to server
      var emailBox = document.getElementById("email-box");

      dataToSend = {}
      dataToSend.message = emailBox.value;

      var resultMessage = "Failed to subscribe"

      if (dataToSend.message != '') {
          // send data to server
          socket.emit("subscription", dataToSend)
          resultMessage = "Sucessfully Subscribed!"
      }
      var subMsg = document.getElementById("sub-message");
      
      subMsg.innerText = resultMessage;
}

var submitButton= document.getElementById("submit-button");
submitButton.onclick = function() {  // change event if necessary
    // build up dictionary to send to server
    var emailBox = document.getElementById("contactEmail");
    var nameBox = document.getElementById("contactName");
    var subjectBox = document.getElementById("contactSubject");
    var messageBox = document.getElementById("contactMessage");

    dataToSend = {}
    dataToSend.email = emailBox.value;
    dataToSend.name = nameBox.value;
    dataToSend.subject = subjectBox.value;
    dataToSend.message = messageBox.value;

    var resultMessage = ""

    if (dataToSend.email == '') {
        resultMessage = "Please enter an email.";
    } else if (dataToSend.name == '') {
        resultMessage = "Please enter an name.";
    } else if (dataToSend.subject == '') {
        resultMessage = "Please enter an subject.";
    } else if (dataToSend.message == '') {
        resultMessage = "Please enter an message.";
    } else if (dataToSend.email.indexOf('@') == -1) {
        resultMessage = "Please enter a valid email address."
    } else {
        // send data to server
        socket.emit("message", dataToSend);
        resultMessage = "Sucessfully Sent Message!";
    }

    var subRes= document.getElementById("submit-result");
    subRes.innerText = resultMessage;
}    
