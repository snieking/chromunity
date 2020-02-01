// @ts-ignore
module.exports = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "143CD07CE35CE39321200BFE7BD194585CEA5AAC20AED9066590AF2A1F508CD6"
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