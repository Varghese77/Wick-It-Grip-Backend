/*
 * This javascript code represents the client code that will handle sending
 * email and subscription information to the server.
 */

// socket to host server
const socket = io();

// DOM components that will be used for subscription functionality
const subscribeButton = document.getElementById("ping-button");
const emailBox = document.getElementById("email-box");
const subscribePrompt = document.getElementById("sub-message");

// DOM components that will be used for messaging functionality
const submitButton= document.getElementById("submit-button");
const submitPrompt= document.getElementById("submit-result");

// Sends subscription email address to server and updates
// the subscriber prompt for the user to see the result
subscribeButton.onclick = function() {
    let dataToSend = {
        message: emailBox.value
    }

    let resultMessage = "Failed to subscribe"
    if (dataToSend.message != '') {
        // send data to server
        socket.emit("subscription", dataToSend)
        resultMessage = "Successfully Subscribed!"
    }
    subscribePrompt.innerText = resultMessage;
}

submitButton.onclick = function() {
    // Data fields where input is taken from
    const emailBox = document.getElementById("contactEmail");
    const nameBox = document.getElementById("contactName");
    const subjectBox = document.getElementById("contactSubject");
    const messageBox = document.getElementById("contactMessage");

    // Build Data to send to the server
    dataToSend = {}
    dataToSend.email = emailBox.value;
    dataToSend.name = nameBox.value;
    dataToSend.subject = subjectBox.value;
    dataToSend.message = messageBox.value;

    // Parse though different error possibilities
    let resultMessage = ""
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
    } else {  // No error, will send data to server
        socket.emit("message", dataToSend);
        resultMessage = "Successfully Sent Message!";
    }
    submitPrompt.innerText = resultMessage;
}    
