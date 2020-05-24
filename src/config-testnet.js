// eslint-disable-next-line
module.exports = {
  blockchain: {
    nodeApiUrl: "https://3o5bblkaha.execute-api.eu-west-1.amazonaws.com/chromia-node-vault/",
    rid: "8683A6FB0F8B1A8A9C335ECB69743500590CA881FE567A75C627BA4CFFE7E254",
    explorerBaseUrl: "https://explorer-testnet.chromia.com/"
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
    enabled: true,
    url: "https://matomo.chromia.dev/",
    siteId: 5,
    trackErrors: true,
    jsFileName: "js/",
    phpFilename: "js/"
  },
  topBar: {
    message: "TestNet"
  },
  features: {
    pinEnabled: false,
    vibeEnabled: false
  },
  test: true,
  logLevel: "info"
};
