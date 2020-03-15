import React, { useState } from "react";
import YouTubeIcon from "@material-ui/icons/YouTube";
import IconButton from "@material-ui/core/IconButton";
import { Button, Dialog, DialogActions, DialogContent, TextField } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";

interface Props {
  addText: Function;
}

const AddVideoButton: React.FunctionComponent<Props> = (props: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState("");

  function dialog() {
    return (
      <Dialog open={dialogOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth="sm">
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            type="text"
            id="url"
            label="YouTube URL"
            fullWidth
            value={url}
            onChange={handleUrlChange}
            variant="outlined"
          />
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary" variant="contained">
              Cancel
            </Button>
            <Button onClick={() => addYouTubeVideoToText()} color="primary" variant="contained">
              Add YouTube Video
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );
  }

  function handleUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();
    setUrl(event.target.value);
  }

  function addYouTubeVideoToText() {
    if (url != null && isValidYouTubeUrl(url)) {
      const idRegExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(idRegExp);
      if (match && match[2].length === 11) {
        props.addText(`[![YouTube Video](http://img.youtube.com/vi/${match[2]}/0.jpg)](${url})`);
      }
    }

    setDialogOpen(false);
    setUrl("");
  }

  function isValidYouTubeUrl(url: string) {
    if (url !== undefined || url !== "") {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\?v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11;
    }

    return false;
  }

  return (
    <>
      <Tooltip title="YouTube">
        <IconButton onClick={() => setDialogOpen(!dialogOpen)}>
          <YouTubeIcon />
        </IconButton>
      </Tooltip>
      {dialog()}
    </>
  );
};

export default AddVideoButton;
