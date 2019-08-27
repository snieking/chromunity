import React, { FormEvent, useEffect, useState } from "react";

import { Dialog, makeStyles, Snackbar, Tab, Tabs, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import { ReplyAll } from "@material-ui/icons";
import { createTopicReply } from "../../blockchain/TopicService";
import { getCachedUserMeta, getUser } from "../../util/user-util";
import { CustomSnackbarContentWrapper } from "../common/CustomSnackbar";
import { UserMeta } from "../../types";
import { largeButtonStyles } from "./ButtonStyles";
import MarkdownRenderer from "../common/MarkdownRenderer";

export interface ReplyTopicButtonProps {
  submitFunction: Function;
  topicId: string;
  topicAuthor: string;
}

const useStyle = makeStyles(largeButtonStyles);

const ReplyTopicButton: React.FunctionComponent<ReplyTopicButtonProps> = props => {
  const classes = useStyle(props);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [newReplySuccessStatusOpen, setNewReplySuccessStatusOpen] = useState<boolean>(false);
  const [newReplyErrorStatusOpen, setNewReplyErrorStatusOpen] = useState<boolean>(false);
  const [newReplyStatusMessage, setNewReplyStatusMessage] = useState<string>("");
  const [userMeta, setUserMeta] = useState<UserMeta>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const user = getUser();

  useEffect(() => {
    getCachedUserMeta().then(meta => setUserMeta(meta));
    // eslint-disable-next-line
  }, []);

  function handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();
    setMessage(event.target.value);
  }

  function createReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createTopicReply(user, props.topicId, message)
      .then(() => {
        setNewReplyStatusMessage("Reply sent");
        setNewReplySuccessStatusOpen(true);
        props.submitFunction();
      })
      .catch(() => {
        setNewReplyStatusMessage("Error while sending reply");
        setNewReplyErrorStatusOpen(true);
      });

    setMessage("");
    setNewReplySuccessStatusOpen(true);
    setDialogOpen(false);
  }

  function createTopicButton() {
    if (user != null && userMeta != null && userMeta.suspended_until < Date.now()) {
      return (
        <div className={classes.buttonWrapper}>
          <IconButton aria-label="Reply to topic" onClick={() => setDialogOpen(!dialogOpen)} className={classes.button}>
            <ReplyAll fontSize="large" className={classes.icon} />
          </IconButton>
        </div>
      );
    }
  }

  function newTopicDialog() {
    return (
      <div>
        <Dialog open={dialogOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"sm"}>
          <form onSubmit={createReply}>
            <DialogContent>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="New reply">
                <Tab
                  label={
                    <Typography component="span" variant="body2">
                      Edit
                    </Typography>
                  }
                  {...a11yProps(0)}
                />
                <Tab
                  label={
                    <Typography component="span" variant="body2">
                      Preview
                    </Typography>
                  }
                  {...a11yProps(1)}
                />
              </Tabs>
              {activeTab === 0 && renderEditor()}
              {activeTab === 1 && renderPreview()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" color="primary" variant="outlined">
                Send
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={newReplySuccessStatusOpen}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <CustomSnackbarContentWrapper variant="success" message={newReplyStatusMessage} />
        </Snackbar>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={newReplyErrorStatusOpen}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <CustomSnackbarContentWrapper variant="error" message={newReplyStatusMessage} />
        </Snackbar>
      </div>
    );
  }

  function renderEditor() {
    return (
      <TextField
        autoFocus
        margin="dense"
        id="message"
        multiline
        label="Reply"
        type="text"
        rows="5"
        rowsMax="15"
        variant="outlined"
        fullWidth
        onChange={handleDialogMessageChange}
        value={message}
        className={classes.content}
      />
    );
  }

  function renderPreview() {
    return (
      <div className={classes.content}>
        <MarkdownRenderer text={message} />
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    };
  }

  function handleTabChange(event: React.ChangeEvent<{}>, newValue: number) {
    setActiveTab(newValue);
  }

  return (
    <div>
      {createTopicButton()}
      {newTopicDialog()}
    </div>
  );

  function handleClose(event: React.SyntheticEvent | React.MouseEvent, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    setNewReplySuccessStatusOpen(false);
    setNewReplyErrorStatusOpen(false);
  }
};

export default ReplyTopicButton;
