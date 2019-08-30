# RNS Subdomain tool
It's a sample DApp that could be seen as a component to facilitate the adoption of RNS.
It shows 2 action flows:
- **Register an alias:** invite a final user to register his subdomain under a given domain.
- **Check subdomain status:** it will allow the user to check if an alias/subdomain is available or not.

You can set the tool up to send an email with a template to the user confirming the registration.
Also the tool will save information about registrations in a Mongo BD.

Read about:
- [Requirements](#Requirements)
- [Limitations](#Limitations)
- [Setup](#Setup)
- [Running the tool](#Running-the-tool) 


## Requirements 

- Nodejs >= 8.9.0
- npm >= 6.8.0
- MongoDB = 3.6.9
- RecaptchaV2 keys (pair client & server)
- An RSK account with balance (to pay the registration)
- Be the owner of the domain under which subdomains will be registered
- SMTP credentials (if you're interested in sending the user a register confirmation)
- An RSK node with no limitations about requests' quantity 

## Limitations 
- The tool could register until 4 simultaneous registrations (it's related with an RSK network limitation).

## Setup
### 1. [Technical setup](/docs/TechnicalSetup.md)


### 2. Contracts


### 3. [Customize the UI](/docs/CustomizeTheUI.md)


## Running the tool
In a terminal, run `node api/app.js`
By default, you will the site in: http://127.0.0.1:3001

![ui]()
