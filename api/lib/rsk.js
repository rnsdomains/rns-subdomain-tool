var web3 = require('./clientWeb3').getWeb3();
var Tx = require('ethereumjs-tx');
var rskjsUtil = require('rskjs-util');
var CONFIG = require('../config.json');
var colors = require('colors/safe');

function readConfig(){
  rifAmount = CONFIG.rifAmount;
  gasLimit = CONFIG.gasLimit;
}

readConfig();

async function getTransactionStatus(txHash){
  var receipt = await web3.eth.getTransactionReceipt(txHash);
  if(!receipt) return "NOT_FOUND";
  if(receipt.status == '0x01') return "SUCCESS";
  return "FAILED";
}

function dec2hexString(dec) {
  return '0x' + dec.toString(16).toUpperCase();
}

function isValidTxHashFormat(txHash){
  return txHash && txHash.substring(0, 2) == '0x' && (/^(0x)?[0-9a-f]{64}$/i.test(txHash));
}

// Valid format address and if it's checksummed, validates also checksum
function isValidRSKAddress(address) {
  var chainId = CONFIG.chainId;
  if (address === '0x0000000000000000000000000000000000000000') {
    return false;
  }
  if (address.substring(0, 2) !== '0x') {
    return false;
  } else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
  } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
    return true;
  } else {
    return rskjsUtil.isValidChecksumAddress(address, chainId);
  }
}

function createTx(raw){
  return new Tx(raw);
}

function signTx(tx, privKey) {  
  var bufPrivateKey = new Buffer(privKey, 'hex');
  tx.sign(bufPrivateKey);
  var serializedTx = tx.serialize();
  return '0x' + serializedTx.toString('hex');
}

function getNonce(rskAddress){
  var result = web3.eth.getTransactionCount(rskAddress, "pending");
  return result;
}

async function getGasPrice(){  
  var block = await web3.eth.getBlock("latest");  
  if (block.minimumGasPrice <= 1) {
    return 1;
  } else {
    return block.minimumGasPrice * 1.01;
  }
}


function sendTxAsync(tx, pk){
  var signedTx = signTx(tx, pk);
  var result = {};
  try {
    web3.eth.sendSignedTransaction(signedTx);
    
    result.txHash = '0x'+ tx.hash().toString('hex');  
    result.status = true;
    return result;
  }
  catch(ex){
    console.log(colors.red(ex));
    result.status = false;   
    return result; 
  }
}

async function sendTxSync(tx, pk){
  var signedTx = signTx(tx, pk);
  var result = {};
  try {
    var tx = await web3.eth.sendSignedTransaction(signedTx);    
    return tx;
  }
  catch(ex){
    console.log(colors.red(ex));
    result.status = false;   
    return result; 
  }
}

module.exports = {
  getTransactionStatus : getTransactionStatus,  
  isValidRSKAddress : isValidRSKAddress,
  isValidTxHashFormat : isValidTxHashFormat,
  createTx : createTx,
  signTx : signTx, 
  getNonce : getNonce,
  getGasPrice : getGasPrice,
  sendTxAsync : sendTxAsync,
  sendTxSync : sendTxSync
}