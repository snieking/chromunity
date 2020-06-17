# Chromunity
![Continuous Integration](https://github.com/snieking/chromunity/workflows/Continuous%20Integration/badge.svg) [![codecov](https://codecov.io/gh/snieking/chromunity/branch/dev/graph/badge.svg)](https://codecov.io/gh/snieking/chromunity)

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

| Branch  | Address                        |
|---------|--------------------------------|
| master  | https://chromunity.com         |
| testnet | https://testnet.chromunity.com |
| dev     | https://dev.chromunity.com     |

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

# Add RID to project .env which is used for the app to correct to the correct blockchain
./add-rid-to-env.sh
```

### Starting Chromunity
* Navigate back to project root directory
1. `npm install`
2. `npm start`

### Using the dev Vault for Single-Sign-On (SSO)

Chromia provides a development Vault that can be used for local SSO during development.

1. Navigate to https://dev.vault.chromia-development.com
2. Sign-up if you don't have an account there yet. If you already have it, just sign-in.
3. Add a custom dApp, and fill in the following details:
   ```
   DApp name: Chromunity Local
   Host: http://localhost
   Port: 7740
   Website: http://localhost:3000
   Chain ID: <take the one from your .env file>
   ```
4. Click add and you should now be able to sign-in to your local Chromunity using SSO.
