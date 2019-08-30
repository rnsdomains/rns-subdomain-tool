const namehash = require('eth-ens-namehash');
const Whitelist = artifacts.require('./Whitelist.sol');
const SubdomainRegistrar = artifacts.require('./SubdomainRegistrar.sol');


function deploy(deployer, network, accounts) {
  var rnsAddress = "";
  var toolAddress = "";
  var rootNode = namehash.hash("example.rsk");
  

  return deployer.deploy(Whitelist)
  .then((whitelistInstance) => {
    whitelist = whitelistInstance;
    return deployer.deploy(SubdomainRegistrar, rnsAddress, Whitelist.address, rootNode);
  })
  .then(() => {    
    return whitelist.addManager(SubdomainRegistrar.address);    
  })
  .then(( ) => {
    return whitelist.addManager(toolAddress);
  })
}

module.exports = function(deployer, network, accounts) {
    return deploy(deployer, network, accounts);
};

  
