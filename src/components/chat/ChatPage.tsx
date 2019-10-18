import React, { useEffect, useRef, useState } from "react";
import { ApplicationState } from "../../redux/Store";
import { connect } from "react-redux";
import {
  addUserToChatAction,
  checkChatAuthentication,
  createChatKeyPair,
  createNewChat,
  leaveChatAction,
  loadUserChats,
  modifyTitleAction,
  openChat,
  refreshOpenChat,
  sendMessage
} from "../../redux/actions/ChatActions";
import { Container, createStyles, LinearProgress, makeStyles, Theme } from "@material-ui/core";
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
      borderRightColor: theme.palette.primary.main,
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
        height: "70vh",
      },
      borderTopColor: theme.palette.primary.main,
      borderBottomColor: theme.palette.primary.main,
      borderTop: "outset 1px",
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
      cursor: "pointer"
    },
    drawerOpenerBtn: {
      position: "fixed",
      top: "40vh",
      left: "0",
      width: "10px",
      height: "80px",
      borderRadius: "0px 25px 25px 0px",
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        cursor: "pointer"
      }
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
  checkChatAuthentication: typeof checkChatAuthentication;
  createChatKeyPair: typeof createChatKeyPair;
  createNewChat: typeof createNewChat;
  addUserToChat: typeof addUserToChatAction;
  loadUserChats: typeof loadUserChats;
  openChat: typeof openChat;
  refreshOpenChat: typeof refreshOpenChat;
  sendMessage: typeof sendMessage;
  leaveChat: typeof leaveChatAction;
  modifyTitle: typeof modifyTitleAction;
}

interface State {
  password: string;
  selectedChatId: string;
  message: string;
  showAddDialog: boolean;
  userToAdd: string;
  showLeaveChatDialog: boolean;
  modifyTitle: boolean;
  updatedTitle: string;
  drawerOpen: boolean;
  participantsDrawerOpen: boolean;
}

const ChatPage: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);
  const [values, setValues] = useState<State>({
    password: "",
    selectedChatId: "",
    message: "",
    showAddDialog: false,
    userToAdd: "",
    showLeaveChatDialog: false,
    modifyTitle: false,
    updatedTitle: "",
    drawerOpen: false,
    participantsDrawerOpen: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  let interval: any;

  useEffect(() => {
    if (interval != null) {
      clearInterval(interval);
    }
  });

  useEffect(() => {
    const el: HTMLDivElement = scrollRef.current;

    if (el != null) {
      el.scrollTop = el.scrollHeight;
    }
  }, [props.activeChatMessages]);

  const user = getUser();

  if (user == null) {
    return <Redirect to={"/user/login"} />;
  } else if (props.successfullyAuthorized && props.activeChat == null) {
    props.loadUserChats(user.name);
  } else if (props.successfullyAuthorized && props.activeChat != null) {
    interval = setInterval(updateChats, 2500);
  } else if (!props.successfullyAuthorized) {
    props.checkChatAuthentication();
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
    setValues({ ...values, selectedChatId: chat.id });
    props.openChat(chat);
  }

  function renderOpenChat() {
    if (props.activeChat != null) {
      return (
        <Grid item xs={12} md={9} className={classes.chatWrapper}>
          <div>
            <div className={classes.chatActions}>
              <div style={{ float: "right" }}>
                <IconButton onClick={() => setValues({ ...values, showLeaveChatDialog: true })}>
                  <Tooltip title="Leave chat">
                    <RemoveCircle />
                  </Tooltip>
                </IconButton>
                {leaveChatDialog()}
                <IconButton onClick={() => setValues({ ...values, showAddDialog: true })}>
                  <Tooltip title="Invite user">
                    <GroupAdd fontSize="large" />
                  </Tooltip>
                </IconButton>
                <IconButton onClick={() => setValues({ ...values, participantsDrawerOpen: true })}>
                  <Tooltip title="Chat participants">
                    <ListAlt fontSize="large" />
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
          </div>
          {renderChatMessages()}
          {renderMessageWriter()}
        </Grid>
      );
    }
  }

  function listParticipants() {
    return (
      <Drawer anchor="right" open={values.participantsDrawerOpen} onClose={toggleParticipantsDrawer(false)}>
        <List aria-label="main">
          {props.activeChatParticipants.map(name => (
            <ChatParticipantListItem name={name} key={name}/>
          ))}
        </List>
      </Drawer>
    )
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

  function addUserDialog() {
    return (
      <Dialog open={values.showAddDialog} onClose={closeAddUserDialog}>
        <DialogTitle>Add user to chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Invite an user to the chat. The chat is end-to-end encrypted and only the participants are able to read the
            messages. Beacuse of this, the user has to have created a chat passphrase prior to being invited.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Username"
            type="text"
            fullWidth
            onChange={handleChange("userToAdd")}
            value={values.userToAdd}
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
    props.addUserToChat(values.userToAdd, user);
    setValues({ ...values, userToAdd: "", showAddDialog: false });
  }

  function renderChatMessages() {
    return (
      <div className={classes.chatMessages} ref={scrollRef}>
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
        <Button type="submit" variant="contained" color="primary">
          Proceed
        </Button>
      </form>
    );
  }

  function proceed(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.createChatKeyPair(user, values.password);
  }

  function renderContent() {
    if (props.successfullyAuthorized && props.rsaKey != null) {
      return renderChat();
    } else {
      return renderLogin();
    }
  }

  return <Container fixed>{renderContent()}</Container>;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    checkChatAuthentication: () => dispatch(checkChatAuthentication()),
    createChatKeyPair: (user: ChromunityUser, password: string) => dispatch(createChatKeyPair(user, password)),
    createNewChat: (user: ChromunityUser) => dispatch(createNewChat(user)),
    addUserToChat: (targetUser: string, user: ChromunityUser) => dispatch(addUserToChatAction(targetUser, user)),
    loadUserChats: (user: string) => dispatch(loadUserChats(user)),
    openChat: (chat: Chat) => dispatch(openChat(chat)),
    refreshOpenChat: (user: string) => dispatch(refreshOpenChat(user)),
    sendMessage: (user: ChromunityUser, chat: Chat, message: string) => dispatch(sendMessage(user, chat, message)),
    leaveChat: (user: ChromunityUser) => dispatch(leaveChatAction(user)),
    modifyTitle: (user: ChromunityUser, chat: Chat, title: string) => dispatch(modifyTitleAction(user, chat, title))
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
    activeChatParticipants: store.chat.activeChatParticipants
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatPage);
