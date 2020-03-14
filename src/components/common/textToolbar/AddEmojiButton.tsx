import React, { useState } from "react";
import { Popover } from "@material-ui/core";
import { Picker } from "emoji-mart";
import IconButton from "@material-ui/core/IconButton";
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';

interface Props {
  addText: Function;
}

const AddEmojiButton: React.FunctionComponent<Props> = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiBoxOpen, setEmojiBoxOpen] = useState(false);

  function addEmoji(emoji: any) {
    props.addText(emoji.native);
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
    <>
      <IconButton onClick={handleClick}>
        <InsertEmoticonIcon />
      </IconButton>

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
    </>
  );

};

export default AddEmojiButton;