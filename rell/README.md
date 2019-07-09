## Main Requirements

1. Node.js 9.8+
2. Yarn 1.10.1+ (unconfirmed)
3. Npm 65.6.0
4. PostgreSQL 11.4 (should be from 10.5)

# Setting up postgresql for Postchain
* `sudo -u postgres -i`
* `createdb chrotonomy`
* `psql -c "create role postchain LOGIN ENCRYPTED PASSWORD 'postchain'"`
* `psql -c "grant ALL ON DATABASE chromaforum TO postchain"`
* `exit`

# Setting up demo client
* Run `npm install`
* Make a server configuration `src/config.js`
* `npm start`

# Blockchain tests
* Run `npm run test-bc`