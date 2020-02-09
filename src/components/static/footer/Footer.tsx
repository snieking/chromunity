import React from "react";
import { Tooltip } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import GitHubLogo from "./GitHubLogo";
import TwitterLogo from "./TwitterLogo";
import TelegramLogo from "./TelegramLogo";

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
  }
}));

const Footer: React.FunctionComponent = props => {
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
    </footer>
  );
};

export default Footer;
