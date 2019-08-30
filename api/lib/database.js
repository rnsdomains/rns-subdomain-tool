var mongodb = require('mongodb');
var colors = require('colors/safe');
var databaseName = "subdomainsTool";
var registrationsCollection = "registrations";

var dbo;

function connect(url) {
  mongodb.connect(url + databaseName, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    dbo = db.db(databaseName);
    console.log(colors.blue('MongoDB up in ' + url + databaseName));   
    dbo.createCollection(registrationsCollection, function(err, res) {
      if (err) throw err; 
    });    
  });
}

function toRegistrationObject(addr, domain, labelHash, domainHash, mail, txHash){
  return {"datetime" : new Date().toUTCString(),
          "address": addr, 
          "userMail": mail,
          "domain": domain, 
          "domainHash": domainHash,
          "labelHash": labelHash, 
          "txHash": txHash };
}

function addRegistration(newRow){  
  dbo.collection(registrationsCollection).insertOne(newRow, function(err, res) {
    if (err) throw err;
    if(res.result.ok)
    {
      console.log(colors.green("New db row inserted."));
      return res;
    }      
  });
}


module.exports = {
  connect : connect,
  addRegistration : addRegistration,
  toRegistrationObject : toRegistrationObject
}