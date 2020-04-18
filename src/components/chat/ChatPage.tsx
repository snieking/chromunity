import React, { useEffect, useRef, useState } from "react";
import { ApplicationState } from "../../store";
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
} from "./redux/chatActions";
import { CircularProgress, Container, LinearProgress, Snackbar, Theme } from "@material-ui/core";
import ChromiaPageHeader from "../common/ChromiaPageHeader";
import Typography from "@material-ui/core/Typography";
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
  COLOR_CHROMIA_DARK, COLOR_CHROMIA_DARK_LIGHTER,
  COLOR_CHROMIA_LIGHT,
  COLOR_CHROMIA_LIGHTER,
  COLOR_OFF_WHITE
} from "../../theme";
import useTheme from "@material-ui/core/styles/useTheme";
import LoadMoreButton from "../buttons/LoadMoreButton";
import { CustomSnackbarContentWrapper } from "../common/CustomSnackbar";
import { toLowerCase, useInterval } from "../../util/util";
import { chatPageStyles } from "./styles";
import Tutorial from "../common/Tutorial";
import TutorialButton from "../buttons/TutorialButton";
import { step } from "../common/TutorialStep";
import { Redirect } from "react-router";
import TextToolbar from "../common/textToolbar/TextToolbar";

interface OptionType {
  label: string;
  value: string;
}

interface Props {
  autoLoginInProgress: boolean;
  user: ChromunityUser;
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
  const classes = chatPageStyles(props);
  const theme = useTheme();
  const textInput = useRef<HTMLInputElement>(null);

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

  const useCompare = (messages: ChatMessageDecrypted[]) => {
    const prevMessages = usePrevious(messages);
    return prevMessages != null && prevMessages[prevMessages.length - 1] !== messages[messages.length - 1];
  };

  const usePrevious = (messages: ChatMessageDecrypted[]) => {
    const ref = useRef<ChatMessageDecrypted[]>();
    useEffect(() => {
      ref.current = messages;
    });
    return ref.current;
  };

  const newMessages: boolean = useCompare(props.activeChatMessages);

  useEffect(() => {
    const el: HTMLDivElement = scrollRef.current;
    if (el != null && newMessages) {
      el.scrollTop = el.scrollHeight;
    }
  }, [props.activeChatMessages, newMessages]);

  useInterval(() => {
    if (props.successfullyAuthorized) {
      updateChats();
    }
  }, 3000);

  useEffect(() => {
    if (props.user) {
      if (props.successfullyAuthorized && props.activeChat == null) {
        props.loadUserChats(props.user);
      } else if (props.successfullyAuthorized && props.activeChat != null) {
        props.loadChatUsers(props.user);
      } else if (!props.successfullyAuthorized) {
        props.checkChatAuthentication();
      }
    }
    // eslint-disable-next-line
  }, [props.user, props.successfullyAuthorized, props.activeChat]);

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
    if (window.location.href.includes("chat")) {
      props.refreshOpenChat(props.user);
    }
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
          <Box className={classes.drawerOpenerBtn} onClick={toggleDrawer(true)} data-tut="mobile_drawer_btn" />
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
      <div style={{ textAlign: "center", marginTop: "15px", marginLeft: "10px", marginRight: "10px" }}>
        <Button type="button" color="secondary" variant="contained" onClick={() => props.createNewChat(props.user)}>
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
    props.openChat(chat, props.user);
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
    props.modifyTitle(props.user, props.activeChat, values.updatedTitle);
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
    const chat = props.chats.find(value => value.id !== props.activeChat.id);

    props.leaveChat(props.user);
    props.openChat(chat, props.user);

    setValues({ ...values, showLeaveChatDialog: false, selectedChatId: chat != null ? chat.id : "" });
  }

  const suggestions = () => {
    return props.chatUsers
      .filter(user => toLowerCase(user) !== toLowerCase(props.user.name))
      .map(user => ({ value: user, label: user } as OptionType));
  };

  const darkTheme = theme.palette.type === "dark";

  const textColor = darkTheme ? COLOR_OFF_WHITE : COLOR_CHROMIA_DARK;
  const backgroundColor = darkTheme ? COLOR_CHROMIA_DARK : COLOR_CHROMIA_LIGHTER;
  const borderColor = darkTheme ? COLOR_CHROMIA_DARK_LIGHTER : COLOR_CHROMIA_LIGHT;

  const customStyles = {
    option: (provided: any) => ({
      ...provided,
      color: textColor,
      background: backgroundColor,
      border: "1px solid",
      borderColor: borderColor
    }),
    menu: (styles: any) => ({
      ...styles,
      zIndex: 999,
      background: backgroundColor
    }),
    control: (provided: any) => ({
      ...provided,
      background: backgroundColor,
      color: theme.palette.primary.main,
      borderColor: theme.palette.secondary,
      "&:hover": { borderColor: textColor },
      boxShadow: "none"
    }),
    singleValue: (provided: any, state: any) => {
      const opacity = state.isDisabled ? 1 : 1;
      const transition = "opacity 300ms";
      const color = textColor;
      return { ...provided, color, opacity, transition };
    },
    input: (provided: any) => {
      const color = textColor;
      return { ...provided, color };
    },
    noOptionsMessage: (provided: any) => {
      const color = textColor;
      return { ...provided, color };
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
    const selected = values.userToAdd as OptionType;
    if (selected != null) {
      props.addUserToChat(selected.value, props.user);
    }
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.shiftKey && event.keyCode === 13) {
      setValues({ ...values, message: values.message + "\n" });
      event.preventDefault();
    } else if (!event.shiftKey && event.keyCode === 13) {
      event.preventDefault();
      sendMessage();
    }
  };

  function renderMessageWriter() {
    return (
      <form className={classes.messageWrapper} onSubmit={submitMessage}>
        <div className={classes.editorWrapper}>
          <TextToolbar addText={addText} />
          <TextField
            autoFocus={window.screen.width >= 600}
            className={classes.messageField}
            label="Message"
            value={values.message}
            onChange={handleChange("message")}
            rowsMax={5}
            multiline
            fullWidth
            variant="outlined"
            color="secondary"
            onKeyDown={handleKeyDown}
            inputRef={textInput}
          />
        </div>
        <Button type="submit" size="small" className={classes.submitMessage} variant="contained" color="secondary">
          Send
        </Button>
      </form>
    );
  }

  function addText(text: string) {
    const startPosition = textInput.current.selectionStart;
    setValues({
      ...values,
      message: [values.message.slice(0, startPosition), text, values.message.slice(startPosition)].join("")
    });
    setTimeout(() => {
      textInput.current.selectionStart = startPosition + text.length;
      textInput.current.selectionEnd = startPosition + text.length;
    }, 100);
  }

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function sendMessage() {
    if (values.message.length > 0) {
      props.sendMessage(props.user, props.activeChat, values.message.trim());
      setValues({ ...values, message: "" });
    }
  }

  const handleChange = (name: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [name]: event.target.value });
  };

  function renderLogin() {
    return (
      <>
        <form className={classes.content} onSubmit={proceed}>
          <ChromiaPageHeader text={"Enter or Create Chat Password"} />
          <Typography variant="body2" component="p">
            If you forget your password, resetting it will leave all your chats.
          </Typography>
          <Typography variant="body2" component="p">
            Please make sure to not lose your chat password!
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
            Reset chat account
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Proceed
          </Button>
        </form>
        {renderTour()}
      </>
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
    props.deleteChatUser(props.user);
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
    props.createChatKeyPair(props.user, values.password);
    setValues({ ...values, password: "" });
  }

  function renderContent() {
    if (props.autoLoginInProgress) {
      return <div style={{ textAlign: "center", marginTop: "25px" }}><CircularProgress /></div>;
    } else if (!props.autoLoginInProgress && !props.user) {
      return <Redirect to={"/user/login"} />;
    } else if (props.successfullyAuthorized && props.rsaKey != null) {
      return renderChat();
    } else {
      return renderLogin();
    }
  }

  const renderTour = () => {
    return (
      <>
        <Tutorial steps={steps()} />
        <TutorialButton />
      </>
    );
  };

  const steps = (): any[] => {
    return [
      step(
        ".first-step",
        <>
          <p>Chromunity offers an end-to-end encrypted group chat.</p>
          <p>
            Messages are encrypted using a shared secret which is stored encrypted for each user by it's chat key. The
            private chat key is not stored on the blockchain.
          </p>
        </>
      )
    ];
  };

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
    loadUserChats: (user: ChromunityUser) => dispatch(loadUserChats(user)),
    openChat: (chat: Chat, user: ChromunityUser) => dispatch(openChat(chat, user)),
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
    autoLoginInProgress: store.account.autoLoginInProgress,
    loading: store.chat.loading,
    user: store.account.user,
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatPage);
