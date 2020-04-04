# Chromunity
[![Build Status](https://travis-ci.org/snieking/chromunity.svg?branch=master)](https://travis-ci.org/snieking/chromunity)
[![Known Vulnerabilities](https://snyk.io/test/github/snieking/chromunity/dev/badge.svg)](https://snyk.io/test/github/snieking/chromunity)

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

## Running Chromunity

### Requirements
1. Docker
2. Node.js 12+

### Running a local Blockchain 

**Chromunity** can be run with a local blockchain which is useful during development.
This can be done via docker for convenience.

```shell script

# A helper script is provided in the base directory for building the image.
./build-image.sh

# Blockchain can be started after that in the test directory.
cd test/docker
docker-compose up -d

# Add BRID to project .env which is used for the app to correct to the correct blockchain
./add-brid-to-env.sh
```

### Starting Chromunity
* Navigate back to project root directory
* `npm install`
* `npm start`

## Copyrighted fonts
Chromunity uses a copyrighted font which is not included in the repository.

In order to use the Chromia font, add **Battlefin-Black.otf**, as well as **International.ttf** to **public/fonts** directory in order to use that font. 
The application will work fine without it and fall back to other fonts.