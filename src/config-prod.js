// eslint-disable-next-line
module.exports = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: process.env.REACT_APP_BRID,
    explorerBaseUrl: "https://explorer-testnet.chromia.com/"
  },
  vault: {
    url: "https://wallet-v2.chromia.dev",
    callbackBaseUrl: "https://chromunity.com"
  },
  sentry: {
    dsn: "https://a45f0d3d7c5d42819cabb34e32f56998@sentry.io/1851343",
    environment: "MainNet"
  },
  matomo: {
    enabled: true,
    url: "https://matomo.chromia.dev/",
    siteId: 3,
    trackErrors: true,
    jsFileName: "js/",
    phpFilename: "js/"
  },
  topBar: {
    message: ""
  },
  test: false,
  logLevel: "info"
};