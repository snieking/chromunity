// @ts-ignore
const config = {};

config.nodeApiUrl = "http://localhost:7740";
config.blockchainRID = process.env.REACT_APP_BRID;

config.chromunityUrl = "http://localhost:3000";
config.vaultUrl = "http://localhost:3001";

config.gaTrackingId = "UA-80662239-2";

config.sentryDsn = "https://9fcd3766732c4665b89f08e2d58b286f@sentry.io/1870353";
config.sentryEnvironment = "local";

config.testMode = true;

module.exports = config;
