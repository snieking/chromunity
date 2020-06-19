import * as React from "react";
import { Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "redux";
import HeaderNav from "./core/header/HeaderNav";
import Footer from "./core/footer/Footer";
import { CssBaseline } from "@material-ui/core";
import Content from "./Content";
import DynamicTheme from "./core/dynamic-theme/DynamicTheme";
import ReactPiwik from "react-piwik";
import history from "./history";
import * as Sentry from "@sentry/browser";
import * as config from "./config";
import logger from "./shared/util/logger";
import Spinners from "./core/spinners/Spinners";
import ApplicationState from "./core/application-state";

interface Props {
  store: Store<ApplicationState>;
}

if (config.sentry.environment !== "Local") {
  logger.debug("Initializing Sentry with dsn: %s for env: %s", config.sentry.dsn, config.sentry.environment);
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
  });
}

const piwik = config.matomo.enabled
  ? new ReactPiwik({
      url: config.matomo.url,
      siteId: config.matomo.siteId,
      trackErrors: config.matomo.trackErrors,
      jsFilename: config.matomo.jsFileName,
      phpFilename: config.matomo.phpFilename,
    })
  : null;

if (piwik != null) {
  ReactPiwik.push(["enableHeartBeatTimer"]);
  ReactPiwik.push(["trackPageView"]);
}

const App: React.FunctionComponent<Props> = (props) => {
  return (
    <Provider store={props.store}>
      <DynamicTheme>
        <CssBaseline />
        <Router history={piwik != null ? piwik.connectToHistory(history) : history}>
          <HeaderNav />
          <Spinners />
          <Content />
          <Footer />
        </Router>
      </DynamicTheme>
    </Provider>
  );
};

export default App;
