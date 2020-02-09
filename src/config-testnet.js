// @ts-ignore
module.exports = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "92EBBA39663A618515D412FECFACD6F106DD88511FB752E7ECD741105C406980"
  },
  vault: {
    url: "https://vault-testnet.chromia.com",
    callbackBaseUrl: "https://testnet.chromunity.com"
  },
  sentry: {
    dsn: "https://9fcd3766732c4665b89f08e2d58b286f@sentry.io/1870353",
    environment: "testnet"
  },
  matomo: {
    url: "https://matomo.chromia.dev/",
    siteId: 3,
    trackErrors: true,
    jsFileName: "js/",
    phpFilename: "js/"
  },
  topBar: {
    message: "TestNet"
  },
  test: true
};