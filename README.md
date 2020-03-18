# Chromunity
[![Build Status](https://travis-ci.org/snieking/chromunity.svg?branch=master)](https://travis-ci.org/snieking/chromunity) [![![![Known Vulnerabilities](https://snyk.io/test/github/snieking/chromunity/badge.svg)](https://snyk.io/test/github/snieking/chromunity)

**Chromunity** is a decentralized social media site where the data is stored in a blockchain. It is built with Rell, an easy to learn and powerful language. Rell is used to interact with https://chromia.com

## Want to contribute?

**Chromunity** is intended to be a community for the users, by the users. This means that contributions are highly appreciated. 
I will of course continue to maintain and implement new features, at the same time.

### Discussions
Discussions related to **Chromunity** development is done in https://dev.chromunity.com/c/ChromunityDev. 
Please feel free to ask questions or discuss **Chromunity** related development topics there.

### CI / CD branches
**Chromunity** is automatically deployed as commits get merged. Work is always done first on the `dev` branch. 
When new features are stable enough in the `dev` branch, they are merged to the `master` branch.

| Branch | Address                    |
|--------|----------------------------|
| master | https://chromunity.com     |
| dev    | https://dev.chromunity.com |

### Running Chromunity

**Chromunity** can be run with a local blockchain which is useful during development.

#### Requirements
1. Node.js 12+
2. Npm 65.6.0
3. PostgresSQL 10.5+

#### Setting up Postgres for Postchain
* `createdb chromunity`
* `psql chromunity`
* `createuser -s postgres`
* `psql -c "create role postchain LOGIN ENCRYPTED PASSWORD 'postchain'"`
* `psql -c "grant ALL ON DATABASE chromunity TO postchain"`
* `\q`

#### Starting local Postchain node
* `cd rell`
* `./run-dev-node.sh`

#### Starting Chromunity
* Navigate back to project root directory
* `npm install`
* `npm start`

## Copyrighted font
Chromunity uses a copyrighted font which is not included in the repository.

In order to use the Chromia font, add **Battlefin-Black.otf**, as well as **International.ttf** to **public/fonts** directory in order to use that font. 
The application will work fine without it and fall back to other fonts.

## Rell UML diagram
https://drive.google.com/file/d/1uCtLX1CNtUNSJTWPFot6jVVHWrElAbqq/view?usp=sharing
