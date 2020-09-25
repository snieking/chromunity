// eslint-disable-next-line
module.exports = {
  blockchain: {
    nodeApiUrl: 'https://cg7tt9fhch.execute-api.eu-central-1.amazonaws.com/dev/',
    rid: 'E024F8A9DC745A3A89923746BEEEF2F9CE088AADCAC8E0239216AF5D7E9B2FB3',
    explorerBaseUrl: 'https://explorer-testnet.chromia.com/',
  },
  vault: {
    url: 'https://dev.vault.chromia-development.com',
    callbackBaseUrl: 'https://dev.chromunity.com',
  },
  sentry: {
    dsn: 'https://a45f0d3d7c5d42819cabb34e32f56998@sentry.io/1851343',
    environment: 'Dev',
  },
  matomo: {
    enabled: true,
    url: 'https://matomo.chromia.dev/',
    siteId: 3,
    trackErrors: true,
    jsFileName: 'js/',
    phpFilename: 'js/',
  },
  topBar: {
    message: 'Development Environment',
  },
  features: {
    pinEnabled: true,
    kudosEnabled: true,
  },
  test: true,
  logLevel: 'debug',
};
