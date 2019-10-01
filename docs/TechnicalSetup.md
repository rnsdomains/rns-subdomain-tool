# Technical Setup

- [Site and node config](#Site-and-node-config)
- [Recaptcha](#Recaptcha)
- [SMTP](#SMTP)

## Site and node config
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


## Recaptcha
The site uses reCaptcha and was tried with reCaptcha v2. 

As a requirement you need to generate your own keys for client-server.

Read about how to get them [here](https://www.google.com/recaptcha/intro/v3.html).

With your key-pair, you need to set:
- Client key in `public/index.html` inside `data-sitekey` attribute:

`<div class="g-recaptcha" data-sitekey="PASTE_THE_KEY_HERE"></div>`

- Server key as value of `recaptcha.key` in file `api/config.json` 


## SMTP
In `api/config.json` you can set up:

- `"smtp.on": true`-> notification by email is ON if this value is `true` 
- `"smtp.host": ""`-> SMTP host 
- `"smtp.port":""` -> SMTP port
- `"smtp.user":""` -> SMTP user 
- `"smtp.password":""` -> SMTP password 
- `"smtp.from":"RNS Domains <hi@iovlabs.org>""` -> SMTP from for the registration result email (use this format to see it with a sender name different to the email: `Sample Name <sample@iovlabs.org>`)
- `"smtp.subject":"Successful registration"` -> mail subject for the registration result email
