import React, { useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { Popover } from "@material-ui/core";
import Button from "@material-ui/core/Button";

interface Props {
  emojiAppender: Function;
  btnSize?: string;
}

const useStyles = makeStyles({
  emojiBoxOpener: {
    position: "absolute",
    cursor: "pointer"
  },
  emojiSizeSmall: {
    fontSize: "12px"
  },
  emojiSizeLarge: {
    fontSize: "26px"
  },
  emojiBoxWrapper: {
    margin: "0 auto",
    width: "100%"
  }
});

const EmojiPicker: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);

  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiBoxOpen, setEmojiBoxOpen] = useState(false);

  function addEmoji(emoji: any) {
    props.emojiAppender(emoji.native);
    setEmojiBoxOpen(false);
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(event.currentTarget);
    setEmojiBoxOpen(!emojiBoxOpen);
  }

  function onClose() {
    setAnchorEl(null);
    setEmojiBoxOpen(false);
  }

  return (
    <div>
      <Button className={`${classes.emojiBoxOpener} ${props.btnSize === "sm" ? classes.emojiSizeSmall : classes.emojiSizeLarge}`} onClick={handleClick}>
        <span role="img" aria-label={"Emoji Picker"}>😀</span>
      </Button>

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
