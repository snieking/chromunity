module.exports = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "2D6E4604E544CC4BA28E0A4AF1E01F0E7A4562E2AE48B0EF5E6B818B2A6562BE"
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