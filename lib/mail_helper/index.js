/* 
 * This module has two functions. validateEmail returns a boolean representing
 * if the input argument string is in the form of a valid email address. send
 * will send an actual email given the correct information.
 */

var nodemailer = require('nodemailer')

module.exports = {
    // Taken From https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript#46181
    // Returns true if email is in valid form, false otherwise
    validateEmail: function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    /*
     * Takes in a mailInfoBuilder object with the following fields...
     *   from: Address that the email will be from
     *   to: Address that the email will be send to
     *   subject: subject of the email that will be sent
     *   text: Text of the email that will be sent
     *   attachments: An array of attachments represented as a dictionary with
     *     fields 'filename' and 'path'. Look at nodemailer API for more info.
     *     Note that attachments will be ignored if set to null.
     *   auth: A dictionary with the 'user' and 'pass' values for email login
     * 
     * This function will then sent the email asynchronously
     */
    send: function(mailInfoBuilder) {
        // Log-in to email
        var smtpTransport = nodemailer.createTransport({
            service: "gmail",
            auth: mailInfoBuilder.auth
        });

        // Build email metadata
        var mailOptions = {
            from: mailInfoBuilder.from,
            to: mailInfoBuilder.to,
            subject: mailInfoBuilder.subject,
            text: mailInfoBuilder.text,
        };
        if (mailInfoBuilder.attachments != null) {
            mailOptions.attachments = mailInfoBuilder.attachments
        }

        // Actually Send email
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(": " + error);
            }
        });
        
    }
}
