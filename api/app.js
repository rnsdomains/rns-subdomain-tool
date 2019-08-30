var express = require('express')
var path = require('path')
var logger = require('morgan')
var cors = require('cors')
var memoryCache = require('memory-cache')
var bodyParser = require('body-parser')
var rskLib = require('./lib/rsk')
var rnsLib = require('./lib/rns')
var database = require('./lib/database')
var smtpClientLib = require('./lib/smtpClient')
var fs = require('fs')
const config = require('./config.json')
var colors = require('colors/safe')
var request = require('request-promise')
var compression = require('compression')

var app = express();
var options = {
    origin: config.cors.ui,
    optionsSuccessStatus: 200      
}

app.use(logger(function (tokens, req, res) {
    return [
      new Date(),
      req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'  
    ].join(' ')
}));

database.connect(config.database.url);

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

var cache = new memoryCache.Cache();
const CALLSAMOUNT = "callsAmount";
const DATE = "date";
cache.put(CALLSAMOUNT, 0);
cache.put(DATE, new Date());
console.log(colors.magenta("Cache created: "))
console.log(colors.magenta(DATE + ": " + cache.get(DATE)));
console.log(colors.magenta(CALLSAMOUNT + ": " + cache.get(CALLSAMOUNT)));

app.listen(config.port, function() {  
  console.log(colors.blue('API - Express server listening on port ' + config.port));
})

var staticOptions = {
    dotfiles: 'ignore',
    extensions: ['css', 'html', 'png','ico','js','json'],
    setHeaders: function (res, path, stat) {
        res.setHeader("Cache-Control", "public, max-age=300000");
        res.setHeader("Expires", new Date(Date.now() + 300000).toUTCString());
    }
}

app.get('/*', function (req, res, next) {    
    next();
});
 
function shouldCompress (req, res) {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
}
  
app.use(compression({filter: shouldCompress}))
app.use(express.static('public', staticOptions)); 

app.get('/status', function(req, res){
    return res.status(200).send(true);
})

// result = { "status": "AVAILABLE|OWNED", "owner" : "0x.." }
app.get('/subdomainStatus', cors(options), async function(req, res){    
    console.log(colors.yellow("Subdomain status request: " + JSON.stringify(req.query)));
    var result = {};
    var domain = req.query.subdomain.toLowerCase();
    if(!rnsLib.isValidDomain(domain)){
        result.details = "Invalid RNS domain";
        console.log(colors.red(result.details)); 
        return res.status(400).send(result);
    }
    try{
        result.status = await rnsLib.getSubdomainStatus(domain);        
        console.log(colors.green("Result: " + JSON.stringify(result)));  
        return res.status(200).send(result);
    }
    catch(ex){
        console.log(colors.red(ex));
        result.status = false;
        result.details = ex.toString();
        return res.status(500).send(result);
    }
})

// result.status = { SUCCESS, FAILED, NOT_FOUND }
app.get('/transactionStatus', cors(options), async function(req, res){
    console.log(colors.yellow("Tx status request: " + JSON.stringify(req.query)));
    var result = {};
    if(!rskLib.isValidTxHashFormat(req.query.txHash)){
        result.details = "Invalid tx hash";
        console.log(colors.red(result.details));
        return res.status(400).send(result);
    }
    try{
        result.status = await rskLib.getTransactionStatus(req.query.txHash);
        return res.status(200).send(result);
    }
    catch(ex){
        console.log(colors.red(ex));
        result.status = false;
        result.details = ex.toString();
        return res.status(500).send(result);
    }
})

app.post('/setSubdomainNode', cors(options), async function (req, res) {      
    var result = { status : false };
    try {  
        console.log(colors.yellow("Request: " + JSON.stringify(req.body)));
        var addr = req.body.address.toLowerCase();
        var domain = req.body.domain.toLowerCase();
        var mail = req.body.mail;
        if(!await isValidCaptcha(req)){    
            result.details = "Invalid captcha code";
            console.log(colors.red(result.details));
            return res.status(400).send(result);
        }

        if(!rskLib.isValidRSKAddress(addr)){            
            result.details = "Invalid RSK address";
            console.log(colors.red(result.details));
            return res.status(400).send(result);
        }

        if(!rnsLib.isValidDomain(domain)){            
            result.details = "Invalid RNS domain";
            console.log(colors.red(result.details)); 
            return res.status(400).send(result);
        }
        if(mail && !isValidMail(mail)){
            result.details = "Invalid mail format";
            console.log(colors.red(result.details));
            return res.status(400).send(result);
        }

        var subdomainStatus = await rnsLib.getSubdomainStatus(domain);
        if(subdomainStatus.status != 'AVAILABLE'){
            result.details = "RNS domain unavailable (it's currently owned by someone else -" + subdomainStatus.owner + "-)";
            console.log(colors.red(result.details)); 
            return res.status(400).send(result);
        }

        // if validations passes, ask contract registrar limit per hour
        if(reachCallLimit()){
            result.details = "Too many requests, limit reached.";
            console.log(colors.red(result.details));             
            return res.status(429).send(result);
        }
        
        increaseCallsInCache();

        result  = await rnsLib.setSubnodeOwner(domain, addr);        
        console.log(colors.green("Result registering subdomain: " + JSON.stringify(result)));
        addRegistrationToDatabase(domain, addr, mail, result.txHash);
        sendNotificationByEmail(domain, addr, mail, result.txHash);
        return res.status(200).send(result);

    }
    catch(ex){
        console.log(colors.red(ex));
        result.details = ex.toString();
        return res.status(500).send(result)
    }
})

function reachCallLimit(){ 
    updateCacheDateIfNecessary();
    var configAmount = config.contractLimitCallsPerHour;  
    var cachedAmount = cache.get(CALLSAMOUNT);
    var isLimitReached = cachedAmount >= configAmount;
    console.log(colors.magenta("Limit of calls reached? " + isLimitReached));
    return isLimitReached;
}
    
function updateCacheDateIfNecessary(){
    var actualDate = new Date();
    var cachedDate = cache.get(DATE);
    if(sameDay(actualDate, cachedDate))
        if(sameHour(actualDate, cachedDate))
            return;

    cache.put(DATE, actualDate);
    cache.put(CALLSAMOUNT, 0);
    console.log(colors.magenta("Cache update: DATE from" + cachedDate +" to " + actualDate + " and CALLAMOUNT to 0."));
}

function sameDay(date1, date2){
    return date1.getFullYear() == date2.getFullYear() &&
           date1.getMonth() == date2.getMonth() &&
           date1.getDate() == date2.getDate();
}

function sameHour(date1, date2){
    return date1.getUTCHours() == date2.getUTCHours();
}

function increaseCallsInCache(){
    var cachedAmount = cache.get(CALLSAMOUNT);
    var newAmount = cachedAmount + 1;
    cache.put(CALLSAMOUNT, newAmount);    
    console.log(colors.magenta("Cache update: CALLAMOUNT from " + cachedAmount +" to " + newAmount + "."));
}

function isValidMail(mail) 
{
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail));
}

async function isValidCaptcha(req){
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
        return false;    
    return validateGoogleRecaptcha(req);
}

async function validateGoogleRecaptcha(req){
    var secretKey = config.recaptcha.key;
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;    
    return await request(verificationUrl).then(function(response, body) {                             
        console.log(colors.blue("Recaptcha response: " + response));        
        body = JSON.parse(response);
        return body.success !== undefined && body.success;
    }).catch(function (err) {
        console.log(colors.red("Captcha exception: " + err));
        return false;
    });
}

function addRegistrationToDatabase(domain, addr, mail, txHash){
    var aliasSha3 = rnsLib.getSha3(rnsLib.getLabel(domain));
    var domainHash = rnsLib.getNameHash(domain);
    var registrationObject = database.toRegistrationObject(addr, domain, aliasSha3, domainHash, mail, txHash);
    database.addRegistration(registrationObject);
}

function sendNotificationByEmail(domain, addr, mail, txHash){    
    if(config.smtp.on != true)
    { 
        console.log(colors.gray("Mail delivery is disabled"));        
        return;
    }   

    try{
        console.log(colors.blue("Sending email to " + mail + "Info: " + domain + " / " + addr + " / " + txHash));
        fs.readFile(__dirname + '/resources/emailBody.html', 'utf8', function(err, data){
            var htmlBody = data;
            htmlBody= htmlBody.replace('_domain_', domain).replace('_address_', addr).replace('_txHash_', txHash);
            smtpClientLib.initSmtp(config.smtp.host, config.smtp.port, config.smtp.user, config.smtp.password);
            smtpClientLib.send(config.smtp.from, mail, config.smtp.subject, htmlBody);
        });
    }
    catch(ex){
        console.log(colors.red("Error sending email to " + mail + "Info: " + domain + " / " + addr + " / " + txHash + ". Exception: " + ex.toString()));
    }

}

module.exports = app
