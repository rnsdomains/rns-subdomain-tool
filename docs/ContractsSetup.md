# Contracts Setup

- [Deploy](#Deploy)
- [Tool Setup](#Tool-Setup)

## Deploy
To use this tool, you need some contracts to be deployed.
In the folder `/contracts` you have 3 contracts.

Please, reach these results with the tool you prefer.

- An instance of Whitelist.sol deployed 
`deployer.deploy(Whitelist)`


- An instance of SubdomainRegistrar.sol deployed (using RNS address, your domain namehash and the cow account asked in Tools Requirements) 
`deployer.deploy(SubdomainRegistrar, rnsAddress, Whitelist.address, domainNode);`

where:
* `rnsAddress` [see here RNS address](https://docs.rns.rsk.co/Architecture/Registry/) 
* `domainNode` is the result of `namehash.hash("yourdomain.rsk");`


- Configure the instance of SubdomainRegistrar and the cow as Whitelist managers using the `addManager` method:
`whitelist.addManager(SubdomainRegistrar.address);`
`whitelist.addManager(cowAddress);`

- The last **important** step is to create your domain and to configure it with the SubdomainRegistrar as owner.
`rns.setSubnodeOwner(rskHash, web3.utils.sha3(yourDomain), subdomainRegistrarAddress)`

where `rskHash` is the result of `namehash.hash("rsk");`.


## Tool Setup
Once you have the contracts deployed, you need to configure the tool to use them.

In `api/config.json` you have to set up:

- `"domainOwnerAccount" : {}` -> information about the account whitelisted for SubdomainRegistrar. It must be the account which resolves `domainOwnerAccount.domain` and it must have RBTCs to register subdomains.
- `"contracts.rnsAddress": ""`-> RNS contract address ([see here RNS address](https://docs.rns.rsk.co/Architecture/Registry/)).
- `"contracts.registrarAddress": ""`-> SubdomainRegistrar contract address which will be called by this tool to register subdomains.
- `"contracts.whitelistAddress": ""`-> Whitelist contract address used by SubdomainRegistrar.
