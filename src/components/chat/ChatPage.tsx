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
import { GroupAdd, RemoveCircle } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import ConfirmDialog from "../common/ConfirmDialog";

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
    sidePanel: {
      marginTop: "15px",
      borderRight: "2px solid",
      height: "100%",
      borderRightColor: theme.palette.primary.main
    },
    chatWrapper: {
      margin: "0 auto",
      maxWidth: "100%",
      height: "100%"
    },
    chatActions: {
      float: "right"
    },
    chatMessages: {
      overflowY: "auto",
      width: "100%",
      height: "80%",
      maxHeight: "70vh"
    },
    messageWrapper: {
      marginTop: "5px",
      position: "relative",
      bottom: 0,
      width: "100%"
    },
    submitMessage: {
      top: "15px",
      marginLeft: "1%",
      width: "10%",
      [theme.breakpoints.down("xs")]: {
        marginLeft: "3%",
        width: "5%"
      }
    },
    messageField: {
      width: "89%",
      [theme.breakpoints.down("xs")]: {
        width: "80%"
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
  checkChatAuthentication: typeof checkChatAuthentication;
  createChatKeyPair: typeof createChatKeyPair;
  createNewChat: typeof createNewChat;
  addUserToChat: typeof addUserToChatAction;
  loadUserChats: typeof loadUserChats;
  openChat: typeof openChat;
  refreshOpenChat: typeof refreshOpenChat;
  sendMessage: typeof sendMessage;
  leaveChat: typeof leaveChatAction;
}

interface State {
  password: string;
  selectedChatId: string;
  message: string;
  showAddDialog: boolean;
  userToAdd: string;
  showLeaveChatDialog: boolean;
}

const ChatPage: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);
  const [values, setValues] = useState<State>({
    password: "",
    selectedChatId: "",
    message: "",
    showAddDialog: false,
    userToAdd: "",
    showLeaveChatDialog: false
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  let interval: any;

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
    const el: HTMLDivElement = scrollRef.current;

    if (el != null) {
      el.scrollTop = el.scrollHeight;
    }
  }

  function renderChat() {
    return (
      <>
        {props.loading ? <LinearProgress variant="query" /> : <div />}
        <Grid container spacing={1} className={classes.wrapper}>
          <Grid item xs={2} className={classes.sidePanel}>
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
      <Button type="button" color="primary" variant="contained" onClick={() => props.createNewChat(user)}>
        New Chat
      </Button>
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
        <Grid item xs={9} className={classes.chatWrapper}>
          <div>
            <div className={classes.chatActions}>
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
              {addUserDialog()}
            </div>
            <h1>{props.activeChat.title}</h1>
          </div>
          {renderChatMessages()}
          {renderMessageWriter()}
        </Grid>
      );
    }
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
    props.leaveChat(user);

    const index: number = props.chats.indexOf(props.activeChat);
    let chat;
    if (props.chats.length > 1 && index !== 0) {
      chat = props.chats[0];
      console.log("1st option...");
      props.openChat(chat);
    } else if (props.chats.length > 1) {
      chat = props.chats[index + 1];
      console.log("2nd option...");
      props.openChat(chat);
    }

    setValues({ ...values, showLeaveChatDialog: false, selectedChatId: chat.id });
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
        />
        <Button type="submit" size="small" className={classes.submitMessage} variant="contained" color="primary">
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
    leaveChat: (user: ChromunityUser) => dispatch(leaveChatAction(user))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    loading: store.chat.loading,
    rsaKey: store.chat.rsaKey,
    successfullyAuthorized: store.chat.successfullyAuthorized,
    chats: store.chat.chats,
    activeChat: store.chat.activeChat,
    activeChatMessages: store.chat.activeChatMessages
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatPage);
