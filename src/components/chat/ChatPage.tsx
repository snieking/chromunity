import React, { useEffect, useRef, useState } from "react";
import { ApplicationState } from "../../redux/Store";
import { connect } from "react-redux";
import {
  addUserToChatAction,
  checkChatAuthentication,
  createChatKeyPair,
  createNewChat,
  deleteChatUserAction,
  leaveChatAction,
  loadChatUsersAction,
  loadOlderMessagesAction,
  loadUserChats,
  modifyTitleAction,
  openChat,
  refreshOpenChat,
  sendMessage,
  storeErrorMessage
} from "../../redux/actions/ChatActions";
import { Container, createStyles, LinearProgress, makeStyles, Snackbar, Theme } from "@material-ui/core";
import ChromiaPageHeader from "../common/ChromiaPageHeader";
import Typography from "@material-ui/core/Typography";
import { getUser } from "../../util/user-util";
import { Redirect } from "react-router";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Chat, ChatMessageDecrypted, ChromunityUser } from "../../types";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ChatListItem from "./ChatListItem";
import ChatMessage from "./ChatMessage";
import { GroupAdd, ListAlt, RemoveCircle } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import ConfirmDialog from "../common/ConfirmDialog";
import Drawer from "@material-ui/core/Drawer";
import ChatParticipantListItem from "./ChatParticipantListItem";
import Box from "@material-ui/core/Box";
import Select, { createFilter } from "react-select";
import { ValueType } from "react-select/src/types";
import {
  COLOR_CHROMIA_DARK,
  COLOR_CHROMIA_DARK_LIGHTER,
  COLOR_CHROMIA_LIGHT,
  COLOR_CHROMIA_LIGHTER,
  COLOR_OFF_WHITE,
  COLOR_STEEL_BLUE
} from "../../theme";
import useTheme from "@material-ui/core/styles/useTheme";
import LoadMoreButton from "../buttons/LoadMoreButton";
import { CustomSnackbarContentWrapper } from "../common/CustomSnackbar";

interface OptionType {
  label: string;
  value: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      textAlign: "center"
    },
    textField: {
      width: "350px",
      maxWidth: "80%"
    },
    wrapper: {
      paddingTop: "15px"
    },
    desktopSidePanel: {
      [theme.breakpoints.down("md")]: {
        display: "none"
      },
      marginTop: "15px",
      height: "100%",
      borderRightColor: theme.palette.secondary.main,
      borderRight: "solid 2px"
    },
    mobileSidePanel: {
      [theme.breakpoints.up("lg")]: {
        display: "none"
      },
      float: "left",
      position: "relative"
    },
    chatWrapper: {
      margin: "0 auto",
      maxWidth: "100%",
      height: "100%"
    },
    chatActions: {
      paddingBottom: "10px"
    },
    chatMessages: {
      overflowY: "auto",
      width: "100%",
      maxWidth: "100%",
      height: "50vh",
      [theme.breakpoints.up("lg")]: {
        height: "70vh"
      },
      borderTopColor: theme.palette.primary.main,
      borderTop: "outset 1px",
      borderBottomColor: theme.palette.primary.main,
      borderBottom: "outset 1px"
    },
    messageWrapper: {
      paddingTop: "20px",
      bottom: 0,
      textAlign: "center"
    },
    submitMessage: {
      top: "15px",
      marginLeft: "3%",
      width: "10%"
    },
    messageField: {
      width: "70%"
    },
    title: {
      cursor: "pointer",
      [theme.breakpoints.down("xs")]: {
        fontSize: "24px"
      }
    },
    chatActionBtn: {
      fontSize: "28px",
      [theme.breakpoints.down("xs")]: {
        fontSize: "20px"
      }
    },
    drawerOpenerBtn: {
      position: "fixed",
      top: "40vh",
      left: "0",
      width: "12px",
      height: "80px",
      borderRadius: "0px 25px 25px 0px",
      backgroundColor: theme.palette.secondary.main,
      "&:hover": {
        cursor: "pointer"
      }
    },
    addUserDialog: {
      position: "relative",
      height: "auto",
      overflow: "visible"
    },
    dialogStyle: {
      overflow: "visible"
    },
    dropDownMenu: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: "100%",
      overflow: "visible"
    }
  })
);

interface Props {
  loading: boolean;
  rsaKey: any;
  successfullyAuthorized: boolean;
  chats: Chat[];
  activeChat: Chat;
  activeChatMessages: ChatMessageDecrypted[];
  activeChatParticipants: string[];
  activeChatCouldExistOlderMessages: boolean;
  followedChatUsers: string[];
  chatUsers: string[];
  errorMessage: string;
  errorMessageOpen: boolean;
  checkChatAuthentication: typeof checkChatAuthentication;
  createChatKeyPair: typeof createChatKeyPair;
  deleteChatUser: typeof deleteChatUserAction;
  createNewChat: typeof createNewChat;
  addUserToChat: typeof addUserToChatAction;
  loadUserChats: typeof loadUserChats;
  openChat: typeof openChat;
  refreshOpenChat: typeof refreshOpenChat;
  sendMessage: typeof sendMessage;
  leaveChat: typeof leaveChatAction;
  modifyTitle: typeof modifyTitleAction;
  loadChatUsers: typeof loadChatUsersAction;
  loadOlderMessages: typeof loadOlderMessagesAction;
  storeErrorMessage: typeof storeErrorMessage;
  theme: Theme;
}

interface State {
  password: string;
  selectedChatId: string;
  message: string;
  showAddDialog: boolean;
  userToAdd: ValueType<OptionType>;
  showLeaveChatDialog: boolean;
  modifyTitle: boolean;
  updatedTitle: string;
  drawerOpen: boolean;
  participantsDrawerOpen: boolean;
  scrolledToTop: boolean;
  snackbarMessage: string;
  snackbarOpen: boolean;
  showResetChatAccountDialog: boolean;
}

const ChatPage: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);
  const theme = useTheme();

  const [values, setValues] = useState<State>({
    password: "",
    selectedChatId: "",
    message: "",
    showAddDialog: false,
    userToAdd: null,
    showLeaveChatDialog: false,
    modifyTitle: false,
    updatedTitle: "",
    drawerOpen: false,
    participantsDrawerOpen: false,
    scrolledToTop: true,
    snackbarMessage: "",
    snackbarOpen: false,
    showResetChatAccountDialog: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const useCompare = (val: number) => {
    const prevVal = usePrevious(val);
    return prevVal !== val;
  };

  const usePrevious = (value: number) => {
    const ref = useRef<number>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const newMessages: boolean = useCompare(props.activeChatMessages.length);

  let interval: any;
  useEffect(() => {
    const el: HTMLDivElement = scrollRef.current;
    if (el != null && newMessages) {
      el.scrollTop = el.scrollHeight;
    }
  }, [props.activeChatMessages, newMessages]);

  useEffect(() => {
    if (interval != null) {
      clearInterval(interval);
    }
  });

  const user = getUser();

  if (user == null) {
    return <Redirect to={"/user/login"} />;
  } else if (props.successfullyAuthorized && props.activeChat == null) {
    props.loadUserChats(user.name);
  } else if (props.successfullyAuthorized && props.activeChat != null) {
    interval = setInterval(updateChats, 5000);
    props.loadChatUsers(user);
  } else if (!props.successfullyAuthorized) {
    props.checkChatAuthentication();
  }

  function handleScroll() {
    const scrollDiv = scrollRef.current;
    if (scrollDiv != null) {
      if (!values.scrolledToTop && scrollDiv.scrollTop === 0) {
        setValues({ ...values, scrolledToTop: true });
      } else if (values.scrolledToTop && scrollDiv.scrollTop > 0) {
        setValues({ ...values, scrolledToTop: false });
      }
    }
  }

  if (values.selectedChatId.length === 0 && props.activeChat != null) {
    setValues({ ...values, selectedChatId: props.chats[0].id });
  }

  function updateChats() {
    if (!window.location.href.includes("chat")) {
      clearInterval(interval);
    }

    props.refreshOpenChat(user.name);
  }

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setValues({ ...values, drawerOpen: open });
  };

  const toggleParticipantsDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setValues({ ...values, participantsDrawerOpen: open });
  };

  const mobileDrawerList = () => (
    <div>
      {renderChatCreationActions()}
      {listChatRooms()}
    </div>
  );

  function renderChat() {
    return (
      <>
        {props.loading ? <LinearProgress variant="query" /> : <div />}
        <div className={classes.mobileSidePanel}>
          <Box className={classes.drawerOpenerBtn} onClick={toggleDrawer(true)} />
          <Drawer open={values.drawerOpen} onClose={toggleDrawer(false)}>
            {mobileDrawerList()}
          </Drawer>
        </div>
        <Grid container spacing={0} className={classes.wrapper}>
          <Grid item xs={2} className={classes.desktopSidePanel}>
            {renderChatCreationActions()}
            {listChatRooms()}
          </Grid>
          {renderOpenChat()}
        </Grid>
      </>
    );
  }

  function renderChatCreationActions() {
    return (
      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <Button type="button" color="secondary" variant="contained" onClick={() => props.createNewChat(user)}>
          New Chat
        </Button>
      </div>
    );
  }

  function listChatRooms() {
    return (
      <List component="nav" aria-label="main">
        {props.chats.map(chat => (
          <ChatListItem key={chat.id} chat={chat} selectedId={values.selectedChatId} onClick={selectChat} />
        ))}
      </List>
    );
  }

  function selectChat(chat: Chat) {
    setValues({ ...values, selectedChatId: chat.id, drawerOpen: false });
    props.openChat(chat);
  }

  function renderOpenChat() {
    if (props.activeChat != null) {
      return (
        <Grid item xs={12} md={9} className={classes.chatWrapper}>
          <div className={classes.chatActions}>
            <div style={{ float: "right" }}>
              <IconButton onClick={() => setValues({ ...values, showLeaveChatDialog: true })}>
                <Tooltip title="Leave chat">
                  <RemoveCircle fontSize="inherit" className={classes.chatActionBtn} />
                </Tooltip>
              </IconButton>
              {leaveChatDialog()}
              <IconButton onClick={() => setValues({ ...values, showAddDialog: true })}>
                <Tooltip title="Invite user">
                  <GroupAdd fontSize="inherit" className={classes.chatActionBtn} />
                </Tooltip>
              </IconButton>
              <IconButton onClick={() => setValues({ ...values, participantsDrawerOpen: true })}>
                <Tooltip title="Chat participants">
                  <ListAlt fontSize="inherit" className={classes.chatActionBtn} />
                </Tooltip>
              </IconButton>
              {addUserDialog()}
              {listParticipants()}
            </div>
            <Typography
              className={classes.title}
              variant="h1"
              component="h1"
              onClick={() => setValues({ ...values, modifyTitle: true })}
            >
              {props.activeChat.title}
            </Typography>
          </div>
          {editTitleDialog()}
          {renderLoadOlderMessagesButton()}
          {renderChatMessages()}
          {renderMessageWriter()}
        </Grid>
      );
    }
  }

  function renderLoadOlderMessagesButton() {
    if (props.activeChatCouldExistOlderMessages && values.scrolledToTop) {
      return <LoadMoreButton onClick={props.loadOlderMessages} />;
    }
  }

  function listParticipants() {
    return (
      <Drawer anchor="right" open={values.participantsDrawerOpen} onClose={toggleParticipantsDrawer(false)}>
        <List aria-label="main">
          {props.activeChatParticipants.map(name => (
            <ChatParticipantListItem name={name} key={name} />
          ))}
        </List>
      </Drawer>
    );
  }

  function editTitleDialog() {
    return (
      <Dialog open={values.modifyTitle} onClose={() => setValues({ ...values, modifyTitle: false })}>
        <DialogTitle>Modify title</DialogTitle>
        <DialogContent>
          <DialogContentText>What should the new title be?</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            fullWidth
            onChange={handleChange("updatedTitle")}
            value={values.updatedTitle}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="outlined" onClick={() => setValues({ ...values, modifyTitle: false })}>
            Cancel
          </Button>
          <Button color="primary" variant="outlined" onClick={confirmUpdatedTitle}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function confirmUpdatedTitle() {
    setValues({ ...values, modifyTitle: false });
    props.modifyTitle(user, props.activeChat, values.updatedTitle);
  }

  function leaveChatDialog() {
    return (
      <ConfirmDialog
        text="This action will leave the chat"
        open={values.showLeaveChatDialog}
        onClose={closeLeaveChatDialog}
        onConfirm={leaveChat}
      />
    );
  }

  function closeLeaveChatDialog() {
    setValues({ ...values, showLeaveChatDialog: false });
  }

  function leaveChat() {
    clearInterval(interval);

    const chat = props.chats.find(value => value.id !== props.activeChat.id);
    props.openChat(chat);

    setValues({ ...values, showLeaveChatDialog: false, selectedChatId: chat.id });
    props.leaveChat(user);
  }

  const suggestions = () => {
    return props.chatUsers.map(user => ({ value: user, label: user } as OptionType));
  };

  const darkTheme = theme.palette.type === "dark";

  const textColor = darkTheme ? COLOR_OFF_WHITE : COLOR_CHROMIA_DARK;
  const backgroundColor = darkTheme ? COLOR_CHROMIA_DARK : COLOR_CHROMIA_LIGHTER;
  const borderBottomColor = darkTheme ? COLOR_CHROMIA_DARK_LIGHTER : COLOR_CHROMIA_LIGHT;

  const customStyles = {
    option: (provided: any) => ({
      ...provided,
      color: textColor,
      background: backgroundColor,
      borderBottom: "2px solid",
      borderBottomColor: borderBottomColor
    }),
    menu: (styles: any) => ({
      ...styles,
      maxHeight: "1000px",
      zIndex: 999,
      background: backgroundColor
    }),
    control: (provided: any) => ({
      ...provided,
      background: backgroundColor,
      color: theme.palette.primary.main,
      borderColor: COLOR_STEEL_BLUE,
      "&:hover": { borderColor: textColor },
      boxShadow: "none"
    }),
    singleValue: (provided: any, state: any) => {
      const opacity = state.isDisabled ? 1 : 1;
      const transition = "opacity 300ms";
      const color = theme.palette.primary.main;
      return { ...provided, color, opacity, transition };
    },
    input: (provided: any, state: any) => {
      const color = textColor;
      return { ...provided, color };
    },
    noOptionsMessage: (provided: any, state: any) => {
      const color = theme.palette.primary.main;
      return { color };
    }
  };

  function addUserDialog() {
    return (
      <Dialog
        open={values.showAddDialog}
        onClose={closeAddUserDialog}
        fullWidth={true}
        maxWidth={"md"}
        PaperProps={{ className: classes.dialogStyle }}
      >
        <DialogTitle>Add user to chat</DialogTitle>
        <DialogContent className={classes.addUserDialog}>
          <DialogContentText>
            Invite an user to the chat. The chat is end-to-end encrypted and only the participants are able to read the
            messages. Beacuse of this, the user has to have created a chat passphrase prior to being invited.
          </DialogContentText>
          <Select
            placeholder={"Chat user"}
            isSearchable={true}
            options={suggestions()}
            styles={customStyles}
            filterOption={createFilter({ ignoreAccents: false })}
            onChange={(value: ValueType<OptionType>) => setValues({ ...values, userToAdd: value })}
            className={classes.dropDownMenu}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="outlined" onClick={closeAddUserDialog}>
            Cancel
          </Button>
          <Button color="primary" variant="outlined" onClick={confirmAddUser}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  function closeAddUserDialog() {
    setValues({ ...values, showAddDialog: false });
  }

  function confirmAddUser() {
    props.addUserToChat((values.userToAdd as OptionType).value, user);
    setValues({ ...values, userToAdd: null, showAddDialog: false });
  }

  function renderChatMessages() {
    return (
      <div className={classes.chatMessages} ref={scrollRef} onScroll={handleScroll}>
        <List>
          {props.activeChatMessages.map(message => (
            <ChatMessage key={message.timestamp} message={message} />
          ))}
        </List>
      </div>
    );
  }

  function renderMessageWriter() {
    return (
      <form className={classes.messageWrapper} onSubmit={sendMessage}>
        <TextField
          autoFocus
          className={classes.messageField}
          label="Message"
          value={values.message}
          onChange={handleChange("message")}
          rowsMax={5}
          variant="outlined"
          color="secondary"
        />
        <Button type="submit" size="small" className={classes.submitMessage} variant="contained" color="secondary">
          Send
        </Button>
      </form>
    );
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (values.message.length > 0) {
      props.sendMessage(user, props.activeChat, values.message);
      setValues({ ...values, message: "" });
    }
  }

  const handleChange = (name: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [name]: event.target.value });
  };

  function renderLogin() {
    return (
      <form className={classes.content} onSubmit={proceed}>
        <ChromiaPageHeader text={"Enter or Create Chat Password"} />
        <Typography variant="body2" component="p">
          If you forget your password, resetting it will leave all your chats
        </Typography>
        <TextField
          autoFocus
          type="password"
          label="Password"
          className={classes.textField}
          value={values.password}
          onChange={handleChange("password")}
          variant="outlined"
          margin="normal"
        />
        <br />
        <br />
        {resetChatAccountDialog()}
        <Button
          type="button"
          variant="contained"
          color="secondary"
          style={{ marginRight: "5px" }}
          onClick={() => setValues({ ...values, showResetChatAccountDialog: true })}
        >
          Reset account
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Proceed
        </Button>
      </form>
    );
  }

  function resetChatAccountDialog() {
    return (
      <ConfirmDialog
        text="This action will reset your chat account, deleting all your chats memberships and messages"
        open={values.showResetChatAccountDialog}
        onClose={closeResetChatAccountDialog}
        onConfirm={resetChatUser}
      />
    );
  }

  function closeResetChatAccountDialog() {
    setValues({ ...values, showResetChatAccountDialog: false });
  }

  function resetChatUser() {
    props.deleteChatUser(user);
    setValues({
      ...values,
      snackbarMessage: "Chat account resetted",
      snackbarOpen: true,
      password: "",
      showResetChatAccountDialog: false
    });
  }

  function proceed(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.createChatKeyPair(user, values.password);
    setValues({ ...values, password: "" });
  }

  function renderContent() {
    if (props.successfullyAuthorized && props.rsaKey != null) {
      return renderChat();
    } else {
      return renderLogin();
    }
  }

  return (
    <Container fixed>
      <div>{renderContent()}</div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={values.snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setValues({ ...values, snackbarMessage: "", snackbarOpen: false })}
      >
        <CustomSnackbarContentWrapper variant="success" message={values.snackbarMessage} />
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={props.errorMessageOpen}
        autoHideDuration={3000}
        onClose={() => props.storeErrorMessage(null)}
      >
        <CustomSnackbarContentWrapper variant="error" message={props.errorMessage} />
      </Snackbar>
    </Container>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    checkChatAuthentication: () => dispatch(checkChatAuthentication()),
    createChatKeyPair: (user: ChromunityUser, password: string) => dispatch(createChatKeyPair(user, password)),
    deleteChatUser: (user: ChromunityUser) => dispatch(deleteChatUserAction(user)),
    createNewChat: (user: ChromunityUser) => dispatch(createNewChat(user)),
    addUserToChat: (targetUser: string, user: ChromunityUser) => dispatch(addUserToChatAction(targetUser, user)),
    loadUserChats: (user: string) => dispatch(loadUserChats(user)),
    openChat: (chat: Chat) => dispatch(openChat(chat)),
    refreshOpenChat: (user: string) => dispatch(refreshOpenChat(user)),
    sendMessage: (user: ChromunityUser, chat: Chat, message: string) => dispatch(sendMessage(user, chat, message)),
    leaveChat: (user: ChromunityUser) => dispatch(leaveChatAction(user)),
    modifyTitle: (user: ChromunityUser, chat: Chat, title: string) => dispatch(modifyTitleAction(user, chat, title)),
    loadChatUsers: (user: ChromunityUser) => dispatch(loadChatUsersAction(user)),
    loadOlderMessages: () => dispatch(loadOlderMessagesAction()),
    storeErrorMessage: (msg: string) => dispatch(storeErrorMessage(msg))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.chat.loading,
    rsaKey: store.chat.rsaKey,
    successfullyAuthorized: store.chat.successfullyAuthorized,
    chats: store.chat.chats,
    activeChat: store.chat.activeChat,
    activeChatMessages: store.chat.activeChatMessages,
    activeChatCouldExistOlderMessages: store.chat.activeChatCouldExistOlderMessages,
    activeChatParticipants: store.chat.activeChatParticipants,
    followedChatUsers: store.chat.followedChatUsers,
    chatUsers: store.chat.chatUsers,
    errorMessage: store.chat.errorMessage,
    errorMessageOpen: store.chat.errorMessageOpen
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatPage);
