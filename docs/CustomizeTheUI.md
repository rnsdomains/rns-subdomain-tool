# Customize the UI

- [Add a custom name and base domain](#Add-a-custom-name-and-base-domain)
- [Add a custom logo](#Add-a-custom-logo)
- [Registration email template](#Registration-email-template)
- [Explorer](#Explorer)

## Add a custom name and base domain
- Replace `custom.title` in file `/public/config.json/` with the domain. Example: **Community**.
- Replace `custom.parentDomain` in file `/public/config.json/` with the domain under which subdomains will be registered with the format `.domain.rsk`. Example: **.community.rsk**.

## Add a custom logo
- Replace `/public/images/logo-custom.png` with the logo you want to see in navbar (top-right side).
- Replace `custom.logoClickUrl` in file `/public/config.json/` with the URL you want the user see when clicking your logo.

## Registration email template
You can change registration email template replacing this file: `api/resources/emailBody.html`
**IMPORTANT**: you need to include the tokens: `_domain_`, `_address_` and `_txHash_` in your template and the tool will replace them with the users' information. 
By default the template is like this:

![email example]()

## Explorer
When the transaction to register a subdomain is sent to RSK blockchain, the user could go to see it in an RSK explorer. 
The tool uses [https://explorer.rsk.co](https://explorer.rsk.co).
If you prefer you can change it, by setting the key `explorer.tx` inside the `public/config.json` file.
