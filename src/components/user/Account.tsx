import React, { useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { createStyles } from "@material-ui/core";
import { EncryptedAccount } from "../../types";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import WalletIcon from "@material-ui/icons/AccountBalanceWallet";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import { Delete } from "@material-ui/icons";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {deleteAccount} from "../../util/user-util";

const useStyles = makeStyles(
  createStyles({
    textWrapper: {
      width: "70%"
    },
    text: {
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden"
    }
  })
);

interface Props {
  account: EncryptedAccount;
  selectedAccount: EncryptedAccount;
  setSelectedAccount: Function;
}

const Account: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    props.setSelectedAccount(props.account);
  };

  function deleteDialog() {
    return (
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">{"Do you want to delete the account?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deleting the account will delete it from your device.
            The account can be imported again using the backup phrase. Do you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={doDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  function doDelete() {
    setDeleteDialogOpen(false);
    deleteAccount(props.account);
    window.location.reload();
  }

  return (
    <>
      <ListItem
        button
        divider
        selected={props.account === props.selectedAccount}
        onClick={handleClick}
      >
        <ListItemAvatar>
          <WalletIcon />
        </ListItemAvatar>
        <div className={classes.textWrapper}>
        <ListItemText
          primary={props.account.name || ""}
          secondary={props.account.encryptedSeed || ""}
          className={classes.text}
        />
        </div>
        <ListItemSecondaryAction>
          <IconButton onClick={() => setDeleteDialogOpen(true)}>
            <Delete />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      {deleteDialog()}
    </>
  );
};

export default Account;
