import React from 'react';
import ShareIcon from '@material-ui/icons/Share';
import { makeStyles, Menu, MenuItem, Typography, ListItemIcon } from '@material-ui/core';
import {
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';

interface Props {
  text: string;
  onClick: () => void;
}

const useStyles = makeStyles({
  menu: {},
  item: {},
  icon: {
    position: 'relative',
    top: 8,
    marginRight: '10px',
  },
});

const ICON_SIZE = 24;

const SocialShareButton: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    props.onClick();
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
            title={props.text}
            hashtags={['chromunity']}
          >
            <>
              <TwitterIcon className={classes.icon} size={ICON_SIZE} round />
              <Typography variant="body2" component="span">
                Twitter
              </Typography>
            </>
          </TwitterShareButton>
        </MenuItem>
        <MenuItem>
          <TelegramShareButton url={window.location.href} onClick={handleClose}>
            <>
              <TelegramIcon className={classes.icon} size={ICON_SIZE} round />
              <Typography variant="body2" component="span">
                Telegram
              </Typography>
            </>
          </TelegramShareButton>
        </MenuItem>
        <MenuItem>
          <RedditShareButton url={window.location.href} onClick={handleClose}>
            <>
              <RedditIcon className={classes.icon} size={ICON_SIZE} round />
              <Typography variant="body2" component="span">
                Reddit
              </Typography>
            </>
          </RedditShareButton>
        </MenuItem>
        <MenuItem>
          <LinkedinShareButton url={window.location.href} onClick={handleClose}>
            <>
              <LinkedinIcon className={classes.icon} size={ICON_SIZE} round />
              <Typography variant="body2" component="span">
                LinkedIn
              </Typography>
            </>
          </LinkedinShareButton>
        </MenuItem>
      </Menu>
    );
  }

  return (
    <>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          <ShareIcon />
        </ListItemIcon>
        <Typography>Share</Typography>
      </MenuItem>
      {menu()}
    </>
  );
};

export default SocialShareButton;
