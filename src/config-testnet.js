// eslint-disable-next-line
module.exports = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "58771843CE58B890CF6FDE8C57F3F564DF741F0C05C5444D24D3A48BB3674497"
  },
  vault: {
    url: "https://vault-testnet.chromia.com",
    callbackBaseUrl: "https://testnet.chromunity.com"
  },
  sentry: {
    dsn: "https://a45f0d3d7c5d42819cabb34e32f56998@sentry.io/1851343",
    environment: "TestNet"
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
  test: true,
  logLevel: "info"
};