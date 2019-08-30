
var CONFIG = require('../config.json');
var Web3 = require('web3');
var web3; 

function getWeb3() {
  if (web3)
    return web3;
  web3 = new Web3(CONFIG.node);  
  return web3;
}

module.exports = {
  getWeb3 : getWeb3
}