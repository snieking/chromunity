import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import GitHubLogo from "./GitHubLogo";
import TwitterLogo from "./TwitterLogo";
import TelegramLogo from "./TelegramLogo";
import { Help } from "@material-ui/icons";
import { COLOR_CHROMIA_LIGHT, COLOR_STEEL_BLUE } from "../../../theme";
import { connect } from "react-redux";
import { toggleTutorial } from "../../common/redux/CommonActions";
import { ApplicationState } from "../../../store";
import { ChromunityUser } from "../../../types";

const useStyles = makeStyles(theme => ({
  footer: {
    width: "100%",
    position: "relative",
    textAlign: "center",
    marginBottom: "10px"
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    margin: "3px"
  },
  text: {
    fontSize: "12px",
    color: theme.palette.primary.main,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  helpBtn: {
    position: "fixed",
    left: "0"
  },
  helpIcon: {
    color: theme.palette.type === "dark" ? COLOR_CHROMIA_LIGHT : COLOR_STEEL_BLUE
  }
}));

interface Props {
  user: ChromunityUser;
  toggleTutorial: typeof toggleTutorial;
}

const Footer: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  return (
    <footer className={classes.footer}>
      <Tooltip title="Chromia Twitter">
        <a className={classes.link} href="https://twitter.com/Chromia" target="_blank" rel="noopener noreferrer">
          <TwitterLogo />
        </a>
      </Tooltip>
      <Tooltip title="Chromia Telegram">
        <a className={classes.link} href="https://t.me/hellochromia" target="_blank" rel="noopener noreferrer">
          <TelegramLogo />
        </a>
      </Tooltip>
      <Tooltip title="GitHub Repository">
        <a
          className={classes.link}
          href="https://github.com/snieking/chromunity"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubLogo />
        </a>
      </Tooltip>
      {props.user && (
        <Tooltip title={"Tutorial"}>
          <IconButton className={classes.helpBtn} onClick={props.toggleTutorial}>
            <Help className={classes.helpIcon} />
          </IconButton>
        </Tooltip>
      )}
    </footer>
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
