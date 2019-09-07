import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { Store } from "redux";
import { ApplicationState } from "./redux/Store";
import HeaderNav from "./components/static/HeaderNav";
import Footer from "./components/static/Footer";
import { ThemeProvider } from "@material-ui/styles";
import {darkTheme} from "./theme";
import { CssBaseline } from "@material-ui/core";
import Content from "./Content";

interface Props {
  store: Store<ApplicationState>;
}

const App: React.FunctionComponent<Props> = props => {
  return (
    <Provider store={props.store}>
      <ThemeProvider theme={darkTheme}>
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
