const config = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "117C407B3A727EC5DE2DAD4E5C472A289FA79961A5565DFD1E7EFC60897045B9"
  },
  vault: {
    url: "https://wallet-v2.chromia.dev",
    callbackBaseUrl: "https://dev.chromunity.com"
  },
  sentry: {
    dsn: "https://9fcd3766732c4665b89f08e2d58b286f@sentry.io/1870353",
    environment: "dev"
  },
  matomo: {
    url: "https://matomo.chromia.dev/",
    siteId: 3,
    trackErrors: true,
    jsFileName: "js/",
    phpFilename: "js/"
  },
  topBar: {
    message: "Development"
  },
  test: true
};

module.exports = config;