// @ts-ignore
module.exports = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "A806991E072A0018049CDEB66E745035CCD160912C9053C056CAB719F23577B1"
  },
  vault: {
    url: "https://dev.vault.chromia-development.com",
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
    message: "Development Environment"
  },
  test: true
};