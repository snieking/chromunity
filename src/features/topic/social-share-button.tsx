import React from "react";
import ShareIcon from "@material-ui/icons/Share";
import {
  IconButton,
  makeStyles,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
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

interface Props {
  text: string;
}

const useStyles = makeStyles({
  menu: {},
  item: {
  },
  icon: {
    position: "relative",
    top: 8,
    marginRight: "10px",
  },
});

const ICON_SIZE = 24;

const SocialShareButton: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function menu() {
    return (
      <Menu id="social-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem>
          <TwitterShareButton
            url={window.location.href}
            onClick={handleClose}
            children={
              <>
                <TwitterIcon className={classes.icon} size={ICON_SIZE} round={true} />
                <Typography variant="body2" component="span">
                  Twitter
                </Typography>
              </>
            }
            title={props.text}
            hashtags={["chromunity"]}
          />
        </MenuItem>
        <MenuItem>
          <TelegramShareButton
            url={window.location.href}
            onClick={handleClose}
            children={
              <>
                <TelegramIcon className={classes.icon} size={ICON_SIZE} round={true} />
                <Typography variant="body2" component="span">
                  Telegram
                </Typography>
              </>
            }
          />
        </MenuItem>
        <MenuItem>
          <RedditShareButton
            url={window.location.href}
            onClick={handleClose}
            children={
              <>
                <RedditIcon className={classes.icon} size={ICON_SIZE} round={true} />
                <Typography variant="body2" component="span">
                  Reddit
                </Typography>
              </>
            }
          />
        </MenuItem>
        <MenuItem>
          <LinkedinShareButton
            url={window.location.href}
            onClick={handleClose}
            children={
              <>
                <LinkedinIcon className={classes.icon} size={ICON_SIZE} round={true} />
                <Typography variant="body2" component="span">
                  LinkedIn
                </Typography>
              </>
            }
          />
        </MenuItem>
      </Menu>
    );
  }

  return (
    <div>
      <Tooltip title="Share">
        <IconButton aria-controls="social-menu" aria-haspopup="true" onClick={handleClick}>
          <ShareIcon />
        </IconButton>
      </Tooltip>
      {menu()}
    </div>
  );
};

export default SocialShareButton;
