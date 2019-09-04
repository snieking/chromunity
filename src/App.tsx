import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "redux";
import { ApplicationState } from "./redux/Store";
import HeaderNav from "./components/static/HeaderNav";
import Footer from "./components/static/Footer";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./theme";
import { CssBaseline } from "@material-ui/core";
import Content from "./Content";
import ReactGA from "react-ga";
import config from "./config.js";

interface Props {
  store: Store<ApplicationState>;
}

export const initGA = () => {
  ReactGA.initialize(config.gaTrackingId);
};

export const pageView = () => {
  ReactGA.pageview(window.location.pathname + window.location.search);
};

export const gaRellOperationTiming = (variable: string, value: number) => {
  ReactGA.timing({ category: "rell-operation", variable: variable, value: value });
};

export const gaRellQueryTiming = (variable: string, value: number) => {
  ReactGA.timing({ category: "rell-query", variable: variable, value: value });
};

const App: React.FunctionComponent<Props> = props => {
  return (
    <Provider store={props.store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <HeaderNav />
          <Content />
          <Footer />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
