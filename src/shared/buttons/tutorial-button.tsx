import React from "react";

import { createStyles, makeStyles, Tooltip } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import { connect } from "react-redux";
import { COLOR_OFF_WHITE, COLOR_STEEL_BLUE } from "../../theme";
import { toggleTutorial } from "../redux/common-actions";

export interface Props {
  toggleTutorial: typeof toggleTutorial;
}

const useStyles = makeStyles(theme =>
  createStyles({
    helpBtn: {
      position: "fixed",
      bottom: "1px",
      left: "1px",
      zIndex: 10000
    },
    helpIcon: {
      color: theme.palette.type === "dark" ? COLOR_OFF_WHITE : COLOR_STEEL_BLUE,
      height: "32px",
      width: "32px"
    }
  })
);

const TutorialButton: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  return (
    <Tooltip title={"Tutorial"}>
      <IconButton className={classes.helpBtn} onClick={props.toggleTutorial}>
        <Help fontSize="inherit" className={classes.helpIcon} />
      </IconButton>
    </Tooltip>
  );
};

const mapDispatchToProps = {
  toggleTutorial
};

export default connect(null, mapDispatchToProps)(TutorialButton);
