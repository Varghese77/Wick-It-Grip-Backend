var nodemailer = require('nodemailer')

module.exports = {
    // Taken From https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript#46181
    validateEmail: function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    send: function(mailInfoBuilder) {
        var smtpTransport = nodemailer.createTransport({
            service: "gmail",
            auth: mailInfoBuilder.auth
        });

        var mailOptions = {
            from: mailInfoBuilder.from, // sender address
            to: mailInfoBuilder.to, // list of receivers
            subject: mailInfoBuilder.subject, // Subject line
            text: mailInfoBuilder.text, // plain text body
        };

        if (mailInfoBuilder.attachments != null) {
            mailOptions.attachments = mailInfoBuilder.attachments
        }

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(": " + error);
            }
        });
        
    }
}
