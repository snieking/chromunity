import React, { useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { createStyles, Popover, Theme } from "@material-ui/core";
import emojiIcon from './emoji.png';

interface Props {
  emojiAppender: Function;
  btnSize?: string;
}

const useStyles =  makeStyles((theme: Theme) => createStyles({
  emojiBoxOpener: {
    cursor: "pointer",
    position: "absolute",
    top: "13px",
    right: "5px",
    [theme.breakpoints.down("xs")]: {
      display: "none"
    }
  },
  emojiSizeSmall: {
    fontSize: "18px"
  },
  emojiSizeLarge: {
    fontSize: "18px"
  },
  icon: {
    height: "18px",
    width: "18px"
  }
}));

const EmojiPicker: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);

  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiBoxOpen, setEmojiBoxOpen] = useState(false);

  function addEmoji(emoji: any) {
    props.emojiAppender(emoji.native);
    setEmojiBoxOpen(false);
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    setAnchorEl(event.currentTarget);
    setEmojiBoxOpen(!emojiBoxOpen);
  }

  function onClose() {
    setAnchorEl(null);
    setEmojiBoxOpen(false);
  }

  return (
    <div>
      <div className={`${classes.emojiBoxOpener} ${props.btnSize === "sm" ? classes.emojiSizeSmall : classes.emojiSizeLarge}`} onClick={handleClick}>
        <img src={emojiIcon} alt="Emoji Picker" className={classes.icon}/>
      </div>

      <Popover
        open={emojiBoxOpen}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <Picker onSelect={addEmoji} emoji="point_up" />
      </Popover>
    </div>
  );
};

export default EmojiPicker;
