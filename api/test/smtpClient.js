var smtpClientLib = require('../lib/smtpClient');
var fs = require('fs');

var from = "RNS Domains <meri@iovlabs.org>";
var to = "meri@iovlabs.org";
var subject = "TEST SMTP CLIENT";
var body;

describe('SMTP client should', () => {
  it(' send an email and return true when credencials are valid', () => {
    var host = "smtp.gmail.com";
    var port = "465";
    var user = ""; // complete with yours to test
    var pass = ""; // complete with yours to test
    fs.readFile(__dirname + '/emailBody.html', 'utf8', function(err, data){
      // replace emailBody.html with yours to test
      body = data;
      body= body.replace('_domain_', 'meri.rsk').replace('_address_', '0x01').replace('_txHash_', '0x123456');
      smtpClientLib.initSmtp(host, port, user, pass);
      smtpClientLib.send(from, to, subject, body);
    });    
  });
});