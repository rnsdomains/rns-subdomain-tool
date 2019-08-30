var web3 = require('./clientWeb3').getWeb3();
var rskLib = require('./rsk.js');
var namehash = require('eth-ens-namehash').hash;
var rnsContract = require('../abi/registry.js');
var whitelistContract = require('../abi/whitelist.js');
var registrarContract = require('../abi/subdomainRegistrar.js');
var CONFIG = require('../config.json');

var domainOwnerAccount = CONFIG.domainOwnerAccount;

function getRnsContract(){ 
  return rnsContract.build(web3, CONFIG.contracts.rnsAddress);
}

function getWhitelistContract(){      
  return whitelistContract.build(web3, CONFIG.contracts.whitelistAddress);
}

function getRegistrarContract(){   
  return registrarContract.build(web3, CONFIG.contracts.registrarAddress);
}

function getLabel(domain){
  return domain.split('.')[0];
}

function getSha3(str){
  return web3.utils.sha3(str);
}

function getNameHash(str){
  return namehash(str);
}

function getParentDomain(domain){
  var firstPointIndex = domain.indexOf('.');
  return domain.substr(firstPointIndex+1, domain.length - firstPointIndex);
}

function isThreeLevelDomain(domain){
  return domain.split('.').length == 3;
}

function hasValidLabel(domain){
  var label = getLabel(domain);
  const pattern = /^[a-z0-9]+(-{0,1}[a-z0-9])*$/;
  return pattern.test(label) && label.length > 0 && label.length < 256;
}

function hasValidParentDomain(domain){
  return CONFIG.domainOwnerAccount.domain == getParentDomain(domain);
}

function isValidDomain(domain){
  if(!isThreeLevelDomain(domain))
    return false;
  if(!hasValidParentDomain(domain))
    return false;
  if(!hasValidLabel(domain))
    return false;
  
  return true;
}

async function getSubdomainStatus(subdomain){
  var subdomainHash = namehash(subdomain);
  var rns = getRnsContract();
  var owner = await rns.methods.owner(subdomainHash).call();    
  if(owner == "0x0000000000000000000000000000000000000000")
    return { "status": "AVAILABLE" };
  return { "status":"OWNED", "owner": owner.toLowerCase() };
}

function getSubdomainLabel(subdomain){
  return subdomain.substr(0, subdomain.indexOf('.')); 
}

async function doWhitelist(){
  var whitelist = getWhitelistContract();      
  var data = whitelist.methods.addWhitelisted(domainOwnerAccount.address).encodeABI();   
  var nonce = await rskLib.getNonce(domainOwnerAccount.address);   
  var gasPrice = await rskLib.getGasPrice();
  var rawTx = {
    nonce: nonce, gasPrice: gasPrice,
    data: data, gas: CONFIG.gasLimit,
    to: whitelist.address
  };
  var tx = rskLib.createTx(rawTx);  
  return await rskLib.sendTxSync(tx, domainOwnerAccount.privateKey);
}

async function isWhitelistDone(){  
  var whitelist = getWhitelistContract();   
  var isWhitelisted = await whitelist.methods.isWhitelisted(domainOwnerAccount.address).call();    
  return isWhitelisted;
}

async function setSubnodeOwner(domain, addr){
  var node = namehash(domainOwnerAccount.domain);
  var label = web3.utils.sha3(getSubdomainLabel(domain));  
  console.log("setSubnodeOwner: " + domain + " nodehash " + node + " label " + label);
  
  var registrar = getRegistrarContract();
  var data = registrar.methods.register(label, addr).encodeABI();   
  var nonce = await rskLib.getNonce(domainOwnerAccount.address);   
  var gasPrice = await rskLib.getGasPrice();
  var rawTx = {
    nonce: nonce, gasPrice: gasPrice,
    data: data, gas: CONFIG.gasLimit,
    to: registrar.address
  };
  var tx = rskLib.createTx(rawTx);  
  return rskLib.sendTxAsync(tx, domainOwnerAccount.privateKey);
}

module.exports = {
  isValidDomain : isValidDomain,
  getSubdomainStatus : getSubdomainStatus,
  setSubnodeOwner : setSubnodeOwner,
  doWhitelist : doWhitelist,
  isWhitelistDone : isWhitelistDone,
  getSha3 : getSha3,
  getLabel : getLabel,
  getNameHash : getNameHash
}