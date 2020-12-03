# Bitgesell Wallet JS

## About
[Bitgesell](https://bitgesell.ca) Wallet JS - сross-platform wallet!

This frontend application that do not use backend.
All work between the application and the blockchain (Node) conducts directly!
Works from a browser, from a saved page, from anywhere!
It also has a desktop version (Electron) for Linux, macOS, Windows and a mobile application (Cordova) for Android & iOS. As well as a Chrome extension.

------------

## Screenshots

![my_addresses_screenshot](https://user-images.githubusercontent.com/2198826/100698149-bd7a7500-33d2-11eb-84b0-57eaa06afac8.png)

------------

## Build versions

- ### Web: https://app.bglwallet.io (domain is linked to GitHub Pages, we do not use our server to delivery frontend). Alternative: https://raw.githack.com/epexa/bitgesell-wallet-js-dist/master/

------------

## Technical advantages
- Use official Bitgesell JavaScript library [“jsbgl”](https://github.com/bitaps-com/jsbgl).
- It is written without using JS frontend frameworks (React, Vue.JS, etc.), which is why it has a very simple and clear codebase and code architecture.
- Not used by third-party API. Used only [Node RPC](https://rpc.bglwallet.io) and [Explorer API](https://bgl.bitaps.com).

------------

## Features
- [x] is it cross-platform (web-based)
- [x] new wallet creation
- [x] mnemonic seed in wallet creation
- [x] private keys are stored on user-side only
- [x] storage encrypted with AES-GCM 256-bit
- [x] sent transaction (with specify fee)
- [x] generate receiving address
- [x] transactions history
- [x] restore wallet from mnemonic seed
- [x] import address from WIF
- [x] good UX & UI

------------

## Help environment

- ### 1) PRE
1. `npm install`

- ### 2) DEVELOP
1. `npm start`
2. open in browser: http://[IP]:[PORT] (check console message)

*[IP] and [PORT] are specified in [package.json](package.json#L12):*
`"config": {
    "IP": "127.0.0.1",
    "PORT": "80",
  },
`

- ### 3) BUILD
1. `chmod 740 build.sh`
2. `npm run build`

- ### 4) RUN BUILDED
1. `npm run dist-start`
2. open in browser: http://[IP]:[PORT] (check console message)

------------

## This project uses JavaScript libraries
| Name | GitHub | jsDelivr | Version |
|------|--------|----------|---------|
| jsbgl | [GitHub](https://github.com/bitaps-com/jsbgl) | [jsDelivr](https://www.jsdelivr.com/package/npm/jsbgl?path=dist) | 1.0.17
| aes4js | [GitHub](https://github.com/rndme/aes4js) | [jsDelivr](https://www.jsdelivr.com/package/npm/aes4js) | 1.0.0
| satoshi-bitcoin | [GitHub](https://github.com/dawsbot/satoshi-bitcoin) | [jsDelivr](https://www.jsdelivr.com/package/npm/satoshi-bitcoin) | 1.0.4
| Bootswatch | [GitHub](https://github.com/thomaspark/bootswatch) | [jsDelivr](https://www.jsdelivr.com/package/npm/bootswatch?path=dist%2Fflatly) | 4.5.3 |
| Native JavaScript for Bootstrap | [GitHub](https://github.com/thednp/bootstrap.native) | [jsDelivr](https://www.jsdelivr.com/package/npm/bootstrap.native?path=dist) | 3.0.14
| SweetAlert2 | [GitHub](https://github.com/sweetalert2/sweetalert2) | [jsDelivr](https://www.jsdelivr.com/package/npm/sweetalert2?path=dist) | 10.10.1
| DataTables | [GitHub](https://github.com/DataTables/DataTablesSrc) | [jsDelivr](https://www.jsdelivr.com/package/npm/datatables.net?path=js) | 1.10.22
| DataTables Bootstrap 4 | [GitHub](https://github.com/DataTables/Dist-DataTables-Bootstrap4) | [jsDelivr](https://www.jsdelivr.com/package/npm/datatables.net-bs4) | 1.10.22
| DataTables Responsive Bootstrap 4 | [GitHub](https://github.com/DataTables/Responsive) | [jsDelivr](https://www.jsdelivr.com/package/npm/datatables.net-responsive?path=js) | 2.2.6
| jQuery slim (only for DataTables) | [GitHub](https://github.com/jquery/jquery) | [jsDelivr](https://www.jsdelivr.com/package/npm/jquery?path=dist) | 3.5.1

------------

## Issues

When you find issues, please report them!

------------

## Contributions

Patches are welcome! If you would like to contribute, but don't know what to work on, check the issues list.

------------

## Donations

If you'd like to buy me a beer, I won't complain. I will thank you! =)
- BGL: [bgl1qlmzckh904vze03n0lwzptt5dkmvf2vj3ev4qm9](bgl:bgl1qlmzckh904vze03n0lwzptt5dkmvf2vj3ev4qm9)
- BTC: [3HAx7GndxNCeri72xPbuaAyAJT8w2v5XGt](btc:3HAx7GndxNCeri72xPbuaAyAJT8w2v5XGt)
- ETH: [0xa88DcEB0139A56f5b054d22212C0445aD984f685](ethereum:0xa88DcEB0139A56f5b054d22212C0445aD984f685)
- [Other cryptocurrencies (395+ coins)...](https://coinswitch.co/?ref=LLBEOO8IZD)

------------

## Contacts

Telegram: [@epexa](https://t.me/epexa)
