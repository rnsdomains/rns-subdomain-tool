# Contracts Setup

- [Deploy](#Deploy)
- [Tool Setup](#Tool-Setup)

## Deploy




## Tool Setup
Once you have the contracts deployed, you need to configure the tool to use them.
In `api/config.json` you have to set up:

- `"domainOwnerAccount" : {}` -> information about the account whitelisted for SubdomainRegistrar. It must be the account which resolves `domainOwnerAccount.domain` and it must have RBTCs to register subdomains.
- `"contracts.rnsAddress": ""`-> RNS contract address ([see here RNS address](https://docs.rns.rsk.co/Architecture/Registry/)).
- `"contracts.registrarAddress": ""`-> SubdomainRegistrar contract address which will be called by this tool to register subdomains.
- `"contracts.whitelistAddress": ""`-> Whitelist contract address used by SubdomainRegistrar.
