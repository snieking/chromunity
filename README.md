# Chromunity
[![Build Status](https://travis-ci.org/snieking/chromunity.svg?branch=master)](https://travis-ci.org/snieking/chromunity) [![Coverage Status](https://coveralls.io/repos/github/snieking/chromunity/badge.svg?branch=dev)](https://coveralls.io/github/snieking/chromunity?branch=dev)

Chromunity is a decentralized social media site where the data is stored in a blockchain. It is built with Rell, an easy to learn and powerful language. Rell is used to interact with https://chromia.com

## CI / CD branches
Chromunity is automatically deployed as commits get merged. Work is always done first on the `dev` branch. 
When new features are stable enough in the `dev` branch, they are merged to the `master` branch.

| Branch | Address                    |
|--------|----------------------------|
| master | https://chromunity.com     |
| dev    | https://dev.chromunity.com |

## Running Chromunity

Chromunity can be run with a local blockchain which is useful during development.

### Requirements
1. Node.js 9.8+
2. Npm 65.6.0
3. PostgresSQL 10.5+

### Setting up Postgres for Postchain
* `createdb chromunity`
* `psql chromunity`
* `createuser -s postgres`
* `psql -c "create role postchain LOGIN ENCRYPTED PASSWORD 'postchain'"`
* `psql -c "grant ALL ON DATABASE chromunity TO postchain"`
* `\q`

### Starting local Postchain node
* `cd rell`
* `./run-dev-node.sh`

### Starting Chromunity
* Navigate back to project root directory
* `npm install`
* `npm start`

## Copyrighted font
Chromunity uses a copyrighted font which is not included in the repository.

In order to use the Chromia font, add **Battlefin-Black.otf** to **public/fonts** directory in order to use that font. 
The application will work fine without it and fall back to other fonts.

## Rell UML diagram
https://drive.google.com/file/d/1uCtLX1CNtUNSJTWPFot6jVVHWrElAbqq/view?usp=sharing
