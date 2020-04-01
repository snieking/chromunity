// eslint-disable-next-line
module.exports = {
  blockchain: {
    nodeApiUrl: "https://3o5bblkaha.execute-api.eu-west-1.amazonaws.com/chromia-node-vault/",
    rid: "0EEB09D65EBED13ADB57AB0DF6B64C3715E414C359F10EEC0EF92FB21131AFF3"
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