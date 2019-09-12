import { createStyles, Theme } from "@material-ui/core";

export const largeButtonStyles = (theme: Theme) => createStyles({
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
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        }
    },
    icon: {
        color: theme.palette.background.default
    },
    content: {
        marginTop: "15px"
    }
});