import {createStyles} from "@material-ui/core";
import {COLOR_SOFT_PINK} from "../../theme";

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
        width: "64px"
    }
});