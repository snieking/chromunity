import React from 'react';
import AppBar from '@material-ui/core/AppBar/AppBar';
import { Typography } from '@material-ui/core';
import config from '../../config';

interface Props {
  classes: Record<string, string>;
}

const TestInfoBar: React.FunctionComponent<Props> = (props: Props) => {
  if (config.test) {
    return (
      <AppBar position="static" color="secondary">
        <Typography variant="body2" component="p" className={props.classes.testInfo}>
          <b>{config.topBar.message}</b>
        </Typography>
      </AppBar>
    );
  }
  return null;
};

export default TestInfoBar;
