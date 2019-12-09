// @ts-ignore
const config = {};

config.nodeApiUrl = "http://localhost:7740";
config.blockchainRID = process.env.REACT_APP_BRID;

config.chromunityUrl = "http://localhost:3000";
config.vaultUrl = "http://localhost:3001";

config.gaTrackingId = "UA-80662239-2";

config.sentryDsn = "https://a45f0d3d7c5d42819cabb34e32f56998@sentry.io/1851343";
config.sentryEnvironment = "local";

config.testMode = true;

module.exports = config;
