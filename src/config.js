// eslint-disable-next-line
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
    dsn: "https://a45f0d3d7c5d42819cabb34e32f56998@sentry.io/1851343",
    environment: "Local"
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