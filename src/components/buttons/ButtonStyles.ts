import {createStyles} from "@material-ui/core";
import {COLOR_CHROMIA_DARK, COLOR_SOFT_PINK} from "../../theme";

export const largeButtonStyles = createStyles({
    buttonWrapper: {
        position: "fixed",
        bottom: "1px",
        right: "1px"
    },
    button: {
        backgroundColor: COLOR_SOFT_PINK,
        marginRight: "5px",
        marginBottom: "5px",
        height: "64px",
        width: "64px",
        '&:hover': {
            backgroundColor: COLOR_SOFT_PINK,
        }
    },
    icon: {
        color: COLOR_CHROMIA_DARK
    }
});