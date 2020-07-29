var sender = 'smtps://youremailAddress%40gmail.com'   
var password = 'yourEmailPassword'

var nodeMailer = require("nodemailer");
var EmailTemplate = require('email-templates').EmailTemplate;

var transporter = nodeMailer.createTransport(sender + ':' + password + '@smtp.gmail.com');

var sendResetPasswordLink = transporter.templateSender(
  new EmailTemplate('./templates/resetPassword'), {
    	from: 'hello@yourdomain.com',
  });

exports.sendPasswordReset = function (email, username, name, tokenUrl) {
    sendResetPasswordLink({
        to: email,
        subject: 'Password Reset - YourDomain.com'
    }, {
        name: name,
        username: username,
        token: tokenUrl
    }, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log('Link sent\n'+ JSON.stringify(info));
        }
    });
};