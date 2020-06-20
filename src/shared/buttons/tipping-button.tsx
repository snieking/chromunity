import React from 'react';
import { connect } from 'react-redux';
import MoneyIcon from '@material-ui/icons/Money';
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
} from '@material-ui/core';
import { ChromunityUser } from '../../types';
import ApplicationState from '../../core/application-state';
import { notifyError } from '../../core/snackbar/redux/snackbar-actions';
import * as config from '../../config';
import { sendKudos } from '../../features/user/redux/account-actions';
import { toLowerCase } from '../util/util';

interface Props {
  receiver: string;
  user: ChromunityUser;
  kudos: number;
  notifyError: typeof notifyError;
  sendKudos: typeof sendKudos;
}

const TippingButton: React.FunctionComponent<Props> = (props) => {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState<string>('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const sendTip = () => {
    handleClose();
    const kudos = parseInt(amount);
    if (kudos < 1) {
      props.notifyError(`Can't send amount of ${kudos}`);
    } else if (kudos > props.kudos) {
      props.notifyError(`Can't send more kudos than you have, you need ${kudos - props.kudos} more`);
    } else {
      props.sendKudos({ receiver: props.receiver, kudos });
    }

    setAmount('');
  };

  function updateAmount(event: any) {
    const { value } = event.target;
    if (value && value.match(/^[1-9][0-9]*/)) {
      setAmount(`${parseInt(value)}`);
    } else {
      setAmount('');
    }
  }

  function renderDialog() {
    return (
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle>Send kudos</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount of kudos that you would like to send to <b>@{props.receiver}</b> below.
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

  if (!props.user || toLowerCase(props.user.name) === toLowerCase(props.receiver) || !config.features.kudosEnabled) {
    return null;
  }

  return (
    <>
      {renderDialog()}
      <IconButton onClick={handleClickOpen}>
        <Tooltip title="Send kudos">
          <MoneyIcon />
        </Tooltip>
      </IconButton>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    kudos: store.account.kudos,
  };
};

const mapDispatchToProps = {
  notifyError,
  sendKudos,
};

export default connect(mapStateToProps, mapDispatchToProps)(TippingButton);
