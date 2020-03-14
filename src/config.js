// @ts-ignore
module.exports = {
  blockchain: {
    nodeApiUrl: "http://localhost:7740",
    rid: process.env.REACT_APP_BRID
  },
  vault: {
    url: "https://dev.vault.chromia-development.com",
    callbackBaseUrl: "http://localhost:3000"
  },
  sentry: {
    dsn: "https://9fcd3766732c4665b89f08e2d58b286f@sentry.io/1870353",
    environment: "local"
  },
  matomo: {
    url: "https://matomo.chromia.dev/",
    siteId: 3,
    trackErrors: true,
    jsFileName: "js/",
    phpFilename: "js/"
  },
  topBar: {
    message: "Local Environment"
  },
  test: true,
  logLevel: "debug"
};