import React from "react";

import { createStyles, makeStyles, Tooltip } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import { ChromunityUser } from "../../types";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import { COLOR_OFF_WHITE, COLOR_STEEL_BLUE } from "../../theme";
import { toggleTutorial } from "../common/redux/CommonActions";

export interface Props {
  user: ChromunityUser;
  toggleTutorial: typeof toggleTutorial;
}

const useStyles = makeStyles(theme =>
  createStyles({
    wrapper: {

    },
    helpBtn: {
      position: "fixed",
      bottom: "1px",
      left: "1px"
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
    <div className={classes.wrapper}>
      {props.user && (
        <Tooltip title={"Tutorial"}>
          <IconButton className={classes.helpBtn} onClick={props.toggleTutorial}>
            <Help fontSize="inherit" className={classes.helpIcon} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    toggleTutorial: () => dispatch(toggleTutorial())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(TutorialButton);
