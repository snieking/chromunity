import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { ChromunityUser } from '../../types';
import { bidOnItem } from './redux/store-actions';
import ApplicationState from '../../core/application-state';
import { StoreItem } from './store.model';
import { notifyError } from '../../core/snackbar/redux/snackbar-actions';

interface Props {
  open: boolean;
  item: StoreItem;
  currentBid: number;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  user: ChromunityUser;
  bidOnItem: typeof bidOnItem;
  notifyError: typeof notifyError;
}

const BidDialog: React.FunctionComponent<Props> = (props) => {
  const [bid, setBid] = useState(0);

  useEffect(() => {
    setBid(props.currentBid + 5);
  }, [props.currentBid]);

  function handleBidChange(placedBid: number) {
    setBid(placedBid);
  }

  function placeBid() {
    if (bid > props.currentBid) {
      props.onClose();
      props.bidOnItem({ user: props.user, item: props.item, bid, bidSuccessCallback: props.onSuccess });
    } else {
      props.notifyError('New bid must be higher than current one');
    }
  }

  return (
    <Dialog open={props.open} onClose={() => props.onClose()}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <DialogContentText>{`How much do you want to bid for ${props.item.name}?`}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Amount"
          type="number"
          fullWidth
          onChange={(event) => handleBidChange(parseInt(event.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => props.onClose()} color="secondary">
          Cancel
        </Button>
        <Button variant="contained" onClick={placeBid} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    user: state.account.user,
  };
};

const mapDispatchToProps = {
  bidOnItem,
  notifyError,
};

export default connect(mapStateToProps, mapDispatchToProps)(BidDialog);
