import * as React from "react";

import { ThemeProvider } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { connect } from "react-redux";
import { ApplicationState } from "./redux/Store";

interface Props {
  theme: Theme;
}

const DynamicTheme: React.FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {
  return <ThemeProvider theme={props.theme} children={props.children} />;
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    theme: store.styling.theme
  };
};

export default connect(mapStateToProps)(DynamicTheme);
