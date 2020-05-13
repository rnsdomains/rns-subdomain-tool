<p align="middle">
    <img src="https://www.rifos.org/assets/img/logo.svg" alt="logo" height="100" >
</p>
<h3 align="middle"><code>rns-subdomain-tool</code></h3>
<p align="middle">
    Tool to gift RNS subdomains
</p>
<p align="middle">
    <a href="https://developers.rsk.co/rif/rns/tools/Subdomain-tool/">
      <img src="https://img.shields.io/badge/-docs-brightgreen" alt="docs" />
    </a>
</p>

Invite a final user to register his subdomain under a given domain.

:question: Check subdomain status. it will allow the user to check if an alias/subdomain is available or not.

:incoming_envelope: You can set the tool up to send an email with a template to the user confirming the registration.

:information_source: Also the tool will save information about registrations in a Mongo DB.

:raised_hand: This tool includes an option to set up a maximum number of contract calls per hour.

![ui](/docs/images/ui.png)

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
- A cow account: an RSK address with its private key (to pay the registrations). Consider 1 subdomain registration consumes 118k gas.
- The domain under which subdomains will be registered needs to be available or you're the owner
- SMTP credentials (if you're interested in sending the user a register confirmation)
- An RSK node with no limitations about requests' quantity

## Setup

1. [Technical setup](/docs/TechnicalSetup.md)
2. [Contracts](/docs/ContractsSetup.md)
3. [Customize the UI](/docs/CustomizeTheUI.md)

## Running the tool

In a terminal, run `npm install`.
Then run `node api/app.js`.

By default, you will see the site in: http://127.0.0.1:3001

## Querying the database

Database name: `subdomainsTool`.

Collection: `registrations`.

Use these commands to get all the subdomains registrations:

```
use subdomainsTool
db.registrations.find({})
```
