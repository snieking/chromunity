// @ts-ignore
module.exports = {
  blockchain: {
    nodeApiUrl: "https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/",
    rid: "58771843CE58B890CF6FDE8C57F3F564DF741F0C05C5444D24D3A48BB3674497"
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