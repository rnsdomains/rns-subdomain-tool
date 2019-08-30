var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transport;

function initSmtp(host, port, user, password){
  transport = nodemailer.createTransport(smtpTransport({
    host: host,
    port: port,
    secure: true,
    auth: {
      user: user,
      pass: password
    }
  }));
  console.log("SMTP client, ready!")
}

async function send(from, to, subject, body){ 
  var mailOptions = {
    from: from,     
    to: to,
    subject: subject,
    html: body
  };

  transport.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      return false;
    }
    else{
      console.log('Email sent: ' + info.response);      
      return true;
    }
  });
}

module.exports = {
  initSmtp : initSmtp,
  send : send
}