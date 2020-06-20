import * as React from 'react';

import { ThemeProvider } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { connect } from 'react-redux';
import ApplicationState from '../application-state';

interface Props {
  theme: Theme;
}

const DynamicTheme: React.FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {
  return <ThemeProvider theme={props.theme}>{props.children}</ThemeProvider>;
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    theme: store.styling.theme,
  };
};

export default connect(mapStateToProps)(DynamicTheme);
