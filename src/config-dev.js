// @ts-ignore
const config = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "E4FD911A54E96F2858174C1BC50739C4F5D3B75C9F5F2EDCD26DA18CF2B67E37"
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