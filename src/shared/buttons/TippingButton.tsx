import React from "react";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import { ChromunityUser } from "../../types";
import MoneyIcon from "@material-ui/icons/Money";
import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import { setError } from "../../core/snackbar/redux/snackbarTypes";
import * as config from "../../config";
import { sendVibes } from "../../features/user/redux/accountActions";

interface Props {
  receiver: string;
  user: ChromunityUser;
  vibes: number;
  setError: typeof setError;
  sendVibes: typeof sendVibes;
}

const TippingButton: React.FunctionComponent<Props> = (props) => {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState<string>("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const sendTip = () => {
    handleClose();
    const vibes = parseInt(amount);
    if (vibes < 1) {
      props.setError(`Can't send amount of ${vibes}`);
    } else if (vibes > props.vibes) {
      props.setError(`Can't send more vibes than you have, you need ${vibes - props.vibes} more`);
    } else {
      props.sendVibes(props.receiver, vibes);
    }

    setAmount("");
  };

  function updateAmount(event: any) {
    const value: string = event.target.value;
    if (value && value.match(/^[1-9][0-9]*/)) {
      setAmount("" + parseInt(value));
    } else {
      setAmount("");
    }
  }

  function renderDialog() {
    return (
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle>Send vibes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount of vibes that you would like to send to <b>@{props.receiver}</b> below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Amount"
            type="number"
            value={amount}
            onChange={(event) => updateAmount(event)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="contained">
            Cancel
          </Button>
          <Button onClick={sendTip} color="primary" variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!props.user && !config.features.vibeEnabled) return null;

  return (
    <>
      {renderDialog()}
      <IconButton onClick={handleClickOpen}>
        <Tooltip title="Send vibes">
          <MoneyIcon />
        </Tooltip>
      </IconButton>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    vibes: store.account.vibes,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    sendVibes: (receiver: string, vibes: number) => dispatch(sendVibes(receiver, vibes)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TippingButton);
