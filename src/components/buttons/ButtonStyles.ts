import { createStyles, Theme } from "@material-ui/core";

export const largeButtonStyles = (theme: Theme) =>
  createStyles({
    buttonWrapper: {
      position: "fixed",
      bottom: "1px",
      right: "1px"
    },
    button: {
      backgroundColor: theme.palette.primary.main,
      marginRight: "5px",
      marginBottom: "5px",
      height: "64px",
      width: "64px",
      [theme.breakpoints.up("md")]: {
        height: "84px",
        width: "84px"
      },
      "&:hover": {
        backgroundColor: theme.palette.primary.main
      }
    },
    icon: {
      color: theme.palette.background.default,
      height: "32px",
      width: "32px",
      [theme.breakpoints.up("md")]: {
        height: "32px",
        width: "32px"
      }
    },
    editorWrapper: {
      position: "relative"
    },
    btnWrapper: {
      marginTop: "20px"
    },
    pollWrapper: {
      marginTop: "5px",
      marginBottom: "15px"
    }
  });
