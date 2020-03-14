import React, { useState } from "react";
import ImageIcon from "@material-ui/icons/Image";
import IconButton from "@material-ui/core/IconButton";
import { Button, Dialog, DialogActions, DialogContent, TextField } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";

interface Props {
  addText: Function;
}

const AddImageButton: React.FunctionComponent<Props> = (props: Props) => {
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
            label="Image URL"
            fullWidth
            value={url}
            onChange={handleUrlChange}
            variant="outlined"
          />
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary" variant="contained">
              Cancel
            </Button>
            <Button onClick={() => addImageToText()} color="primary" variant="contained">
              Add Image
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

  function addImageToText() {
    props.addText(`![User inserted image](${url})`);
    setDialogOpen(false);
    setUrl("");
  }

  return (
    <>
      <Tooltip title="Image">
        <IconButton onClick={() => setDialogOpen(!dialogOpen)}>
          <ImageIcon />
        </IconButton>
      </Tooltip>
      {dialog()}
    </>
  );
};

export default AddImageButton;
