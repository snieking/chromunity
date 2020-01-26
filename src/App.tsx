import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "redux";
import { ApplicationState } from "./redux/Store";
import HeaderNav from "./components/static/HeaderNav";
import Footer from "./components/static/Footer";
import { CssBaseline } from "@material-ui/core";
import Content from "./Content";
import DynamicTheme from "./DynamicTheme";
import ReactPiwik from "react-piwik";
import history from "./history";
import * as Sentry from '@sentry/browser';
import * as config from "./config";

interface Props {
  store: Store<ApplicationState>;
}

if (config.sentryEnvironment !== "local") {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    beforeSend(event, hint) {
      // Check if it is an exception, and if so, show the report dialog
      if (event.exception && config.testMode) {
        Sentry.showReportDialog({ eventId: event.event_id });
      }
      return event;
    }
  });
}

const piwik = new ReactPiwik({
  url: 'https://matomo.chromia.dev/',
  siteId: 3,
  trackErrors: true,
  jsFilename: "js/",
  phpFilename: "js/"
});

ReactPiwik.push(['enableHeartBeatTimer']);
ReactPiwik.push(['trackPageView']);

const App: React.FunctionComponent<Props> = props => {
  return (
    <Provider store={props.store}>
      <DynamicTheme>
        <CssBaseline />
        <Router history={piwik.connectToHistory(history)}>
          <HeaderNav />
          <Content />
          <Footer />
        </Router>
      </DynamicTheme>
    </Provider>
  );
};

export default App;
