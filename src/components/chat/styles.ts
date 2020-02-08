import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const chatParticipantsListItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    name: {
      color: theme.palette.primary.main
    }
  })
);

export const chatListItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    selected: {
      borderBottom: "2px solid",
      borderBottomColor: theme.palette.secondary.main
    }
  })
);

export const chatMessageStyles = makeStyles((theme: Theme) =>
  createStyles({
    message: {
      background: "none",
      maxWidth: "100%",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      wordBreak: "break-word"
    },
    author: {
      margin: "0 auto"
    },
    authorName: {
      marginTop: "2px",
      textAlign: "center"
    }
  })
);

export const chatPageStyles = makeStyles((theme: Theme) =>
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
        height: "62vh"
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
    },
    editorWrapper: {
      position: "relative"
    },
    emojiWrapper: {
      position: "absolute",
      top: -8,
      left: "78.7%"
    }
  })
);