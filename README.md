# RNS Subdomain tool
It's a sample DApp that could be seen as a component to facilitate the adoption of RNS.
It shows 2 action flows:
- **Register an alias:** invite a final user to register his subdomain under a given domain.
- **Check subdomain status:** it will allow the user to check if an alias/subdomain is available or not.

Read about:
- [Requirements](#Requirements)
- [Limitations](#Limitations)
- [Setup]()
- [Run](#Sample-UI) 


## Requirements 

- Nodejs >= 8.9.0
- npm >= 6.8.0
- MongoDB = 3.6.9
- RecaptchaV2 keys (pair client & server)
- An RSK account with balance (to pay the registration)
- Be the owner of the domain under which subdomains will be registered
- SMTP credentials (if you're interested in sending the user a register confirmation)

