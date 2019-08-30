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
### 1. Technical setup
#### Site & node config
In `api/config.json` you can set up:

- `"port": 3001` -> the port where the tool runs
- `"database.url" :"mongodb://localhost:27017/"` -> URL where mongodb is running
- `"cors.ui": "127.0.0.1:3000"` -> to configure CORS policies if necessary
- `"node": "https://public-node.rsk.co"` -> the RSK node to connect to
- `"chainId": 30` -> chainId value, it depens on the network you're using (31 testnet, 30 mainnet, 33 regtest)
- `"gasLimit": "0x67C280"`-> gasLimit used when registering a subnode (suggested `0x67C280`)
- `"contractLimitCallsPerHour": 1000` -> it's a validation related with the maximum amount of times you allow the tool to call the smart contract per hour

Also in `public/config.json` you need to set up:
- `"api.host": "127.0.0.1:3001"` -> with the URL where the tool is deployed

#### Recaptcha
The site uses reCaptcha and was tried with reCaptcha v2. 

As a requirement you need to generate your own keys for client-server.

Read about how to get them [here](https://www.google.com/recaptcha/intro/v3.html).

With your key-pair, you need to set:
- Client key in `public/index.html` inside `data-sitekey` attribute:

`<div class="g-recaptcha" data-sitekey=""></div>`

- Server key as value of `recaptcha.key` in file `api/config.json` 


#### SMTP
In `api/config.json` you can set up:

- `"smtp.on": true`-> Notification by email is ON if this value is `true` 
- `"smtp.host": ""`-> SMTP host 
- `"smtp.port":""` -> SMTP port
- `"smtp.user":""` -> SMTP user 
- `"smtp.password":""` -> SMTP password 
- `"smtp.from":"RNS Domains <hi@iovlabs.org>""` -> SMTP from for the registration result email (use this format to show as SenderName and SenderEmail)
- `"smtp.subject":"Successful registration"` -> Mail subject for the registration result email



### 2. Contracts


### 3. [Customize the UI](/CustomizeTheUI)


## Running the tool
In a terminal, run `node api/app.js`
By default, you will the site in: http://127.0.0.1:3001

![ui]()
