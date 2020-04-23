import React from "react";

import {
  Badge,
  createStyles,
  Dialog,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  WithStyles,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import { ChromunityUser } from "../../types";
import { Delete, Edit, MoreHoriz } from "@material-ui/icons";
import { parseEmojis } from "../../util/text-parsing";
import withStyles from "@material-ui/core/styles/withStyles";
import ConfirmDialog from "../common/ConfirmDialog";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import TextToolbar from "../common/textToolbar/TextToolbar";
import { setInfo, setError } from "../snackbar/redux/snackbarTypes";

const styles = createStyles({
  editorWrapper: {
    position: "relative",
  },
});

export interface EditMessageButtonProps extends WithStyles<typeof styles> {
  editFunction: Function;
  deleteFunction: Function;
  value: string;
  modifiableUntil: number;
  user: ChromunityUser;
  setInfo: typeof setInfo;
  setError: typeof setError;
}

export interface EditMessageButtonState {
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  anchorEl: HTMLElement;
  message: string;
}

const EditMessageButton = withStyles(styles)(
  class extends React.Component<EditMessageButtonProps, EditMessageButtonState> {
    private textInput: React.RefObject<HTMLInputElement>;

    constructor(props: EditMessageButtonProps) {
      super(props);

      this.state = {
        message: props.value,
        editDialogOpen: false,
        deleteDialogOpen: false,
        anchorEl: null,
      };

      this.textInput = React.createRef();

      this.toggleEditDialog = this.toggleEditDialog.bind(this);
      this.toggleDeleteDialog = this.toggleDeleteDialog.bind(this);
      this.submitEdit = this.submitEdit.bind(this);
      this.submitDelete = this.submitDelete.bind(this);
      this.closeMenu = this.closeMenu.bind(this);
      this.handleDialogMessageChange = this.handleDialogMessageChange.bind(this);
      this.addTextFromToolbar = this.addTextFromToolbar.bind(this);
    }

    toggleEditDialog() {
      this.setState((prevState) => ({ editDialogOpen: !prevState.editDialogOpen, anchorEl: null }));
    }

    toggleDeleteDialog() {
      this.setState((prevState) => ({ deleteDialogOpen: !prevState.deleteDialogOpen, anchorEl: null }));
    }

    handleDialogMessageChange(event: React.ChangeEvent<HTMLInputElement>) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ message: parseEmojis(event.target.value) });
    }

    submitEdit() {
      this.toggleEditDialog();
      this.props
        .editFunction(this.state.message)
        .catch((error: Error) => this.props.setError(error.message))
        .then(() => this.props.setInfo("Message successfully edited"));
    }

    submitDelete() {
      this.toggleDeleteDialog();
      this.props
        .deleteFunction()
        .catch((error: Error) => this.props.setError(error.message))
        .then(() => this.props.setInfo("Message successfully deleted"));
    }

    editDialog() {
      return (
        <div>
          <Dialog open={this.state.editDialogOpen} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={"md"}>
            <form>
              <DialogContent>
                <br />
                <div className={this.props.classes.editorWrapper}>
                  <TextToolbar addText={this.addTextFromToolbar} />
                  <TextField
                    autoFocus
                    margin="dense"
                    id="message"
                    multiline
                    label="Text"
                    type="text"
                    rows="3"
                    rowsMax="15"
                    variant="outlined"
                    fullWidth
                    onChange={this.handleDialogMessageChange}
                    value={this.state.message}
                    inputRef={this.textInput}
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.toggleEditDialog()} color="secondary" variant="contained">
                  Cancel
                </Button>
                <Button
                  onKeyPress={(e) => (e.key === "Enter" ? this.submitEdit() : "")}
                  onClick={() => this.submitEdit()}
                  color="primary"
                  variant="contained"
                >
                  Send
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </div>
      );
    }

    addTextFromToolbar(text: string) {
      const startPosition = this.textInput.current.selectionStart;

      this.setState((prevState) => ({
        message: [prevState.message.slice(0, startPosition), text, prevState.message.slice(startPosition)].join(""),
      }));

      setTimeout(() => {
        this.textInput.current.selectionStart = startPosition + text.length;
        this.textInput.current.selectionEnd = startPosition + text.length;
      }, 100);
    }

    closeMenu() {
      this.setState({ anchorEl: null });
    }

    renderMenu() {
      return (
        <Menu
          id="profile-menu"
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={this.closeMenu}
        >
          <MenuItem onClick={this.toggleEditDialog}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <Typography>Edit</Typography>
          </MenuItem>
          <MenuItem onClick={this.toggleDeleteDialog}>
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <Typography>Delete</Typography>
          </MenuItem>
        </Menu>
      );
    }

    render() {
      if (this.props.user != null) {
        return (
          <div style={{ display: "inline-block" }}>
            <Tooltip title="Edit">
              <IconButton
                aria-label="Edit"
                onClick={(event: React.MouseEvent<HTMLElement>) => this.setState({ anchorEl: event.currentTarget })}
              >
                <Badge max={600} badgeContent={this.props.modifiableUntil} color="secondary">
                  <MoreHoriz />
                </Badge>
              </IconButton>
            </Tooltip>
            {this.renderMenu()}
            {this.editDialog()}
            <ConfirmDialog
              onConfirm={this.submitDelete}
              onClose={this.toggleDeleteDialog}
              open={this.state.deleteDialogOpen}
              text="This action will delete the message"
            />
          </div>
        );
      } else {
        return null;
      }
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    setInfo: (msg: string) => dispatch(setInfo(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditMessageButton);
