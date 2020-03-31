import React from "react";
import ShareIcon from "@material-ui/icons/Share";
import { IconButton, useTheme } from "@material-ui/core";
import {
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton
} from "react-share";
import { COLOR_ORANGE } from "../../theme";

interface Props {
  text: string;
}

const ICON_SIZE = 24;

const SocialShareButton: React.FunctionComponent<Props> = props => {
  const theme = useTheme();
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
            children={
              <IconButton onClick={toggle}>
                <TwitterIcon size={ICON_SIZE} round={true} />
              </IconButton>
            }
            title={props.text}
            hashtags={["chromunity"]}
          />
          <TelegramShareButton
            url={window.location.href}
            children={
              <IconButton onClick={toggle}>
                <TelegramIcon size={ICON_SIZE} round={true} />
              </IconButton>
            }
          />
          <RedditShareButton
            url={window.location.href}
            children={
              <IconButton onClick={toggle}>
                <RedditIcon size={ICON_SIZE} round={true} />
              </IconButton>
            }
          />
          <LinkedinShareButton
            url={window.location.href}
            children={
              <IconButton onClick={toggle}>
                <LinkedinIcon size={ICON_SIZE} round={true} />
              </IconButton>
            }
          />
        </>
      );
    }
  }

  return (
    <>
      <IconButton aria-controls="social-menu" aria-haspopup="true" onClick={toggle}>
        <ShareIcon style={{ color: menuOpen ? COLOR_ORANGE : theme.palette.primary.main }} />
      </IconButton>
      {menu()}
    </>
  );
};

export default SocialShareButton;
