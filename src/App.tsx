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

interface Props {
  store: Store<ApplicationState>;
}

Sentry.init({dsn: "https://a45f0d3d7c5d42819cabb34e32f56998@sentry.io/1851343"});

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
