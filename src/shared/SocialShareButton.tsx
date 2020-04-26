import React from "react";
import ShareIcon from "@material-ui/icons/Share";
import { IconButton, useTheme, makeStyles, Tooltip } from "@material-ui/core";
import {
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import { COLOR_ORANGE } from "../theme";

interface Props {
  text: string;
}

const useStyles = makeStyles({
  icon: {
    position: "relative",
    top: 8,
    marginLeft: "5px",
    marginRight: "5px",
  },
});

const ICON_SIZE = 24;

const SocialShareButton: React.FunctionComponent<Props> = (props) => {
  const theme = useTheme();
  const classes = useStyles();

  const [menuOpen, setMenuOpen] = React.useState(false);

  const toggle = () => {
    setMenuOpen(!menuOpen);
  };

  function menu() {
    if (menuOpen) {
      return (
        <>
          <TwitterShareButton
            url={window.location.href}
            onClick={toggle}
            children={<TwitterIcon className={classes.icon} size={ICON_SIZE} round={true} />}
            title={props.text}
            hashtags={["chromunity"]}
          />
          <TelegramShareButton
            url={window.location.href}
            onClick={toggle}
            children={<TelegramIcon className={classes.icon} size={ICON_SIZE} round={true} />}
          />
          <RedditShareButton
            url={window.location.href}
            onClick={toggle}
            children={<RedditIcon className={classes.icon} size={ICON_SIZE} round={true} />}
          />
          <LinkedinShareButton
            url={window.location.href}
            onClick={toggle}
            children={<LinkedinIcon className={classes.icon} size={ICON_SIZE} round={true} />}
          />
        </>
      );
    }
  }

  return (
    <div>
      <Tooltip title="Share">
        <IconButton aria-controls="social-menu" aria-haspopup="true" onClick={toggle}>
          <ShareIcon style={{ color: menuOpen ? COLOR_ORANGE : theme.palette.primary.main }} />
        </IconButton>
      </Tooltip>
      {menu()}
    </div>
  );
};

export default SocialShareButton;
