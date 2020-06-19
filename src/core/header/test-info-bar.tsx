import React from "react";
import config from "../../config";
import AppBar from "@material-ui/core/AppBar/AppBar";
import { Typography } from "@material-ui/core";

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
  } else {
    return null;
  }
};

export default TestInfoBar;
