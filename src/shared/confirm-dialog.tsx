import React from 'react';
import { Dialog } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Props {
  text: string;
  subText?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelMessage?: string;
  confirmMessage?: string;
}

const ConfirmDialog: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <Dialog open={props.open} onClose={() => props.onClose()}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.text}</DialogContentText>
        {props.subText && <DialogContentText>{props.subText}</DialogContentText>}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => props.onClose()} color="secondary">
          {props.cancelMessage || 'Cancel'}
        </Button>
        <Button variant="contained" onClick={() => props.onConfirm()} color="primary">
          {props.confirmMessage || 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
