var nodemailer = require('nodemailer')

module.exports = {
    send: function(mailInfoBuilder) {
        console.log("Hello World");
        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: mailInfoBuilder.host,
                port: mailInfoBuilder.port,
                secure: mailInfoBuilder.secure, // true for 465, false for other ports
                auth: mailInfoBuilder.auth
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: mailInfoBuilder.from, // sender address
                to: mailInfoBuilder.to, // list of receivers
                subject: mailInfoBuilder.subject, // Subject line
                text: mailInfoBuilder.text, // plain text body
                html: mailInfoBuilder.html // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        });
    }
}
