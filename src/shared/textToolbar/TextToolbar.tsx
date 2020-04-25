import React from "react";
import { Grid } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import AddImageButton from "./AddImageButton";
import AddEmojiButton from "./AddEmojiButton";
import AddCodeBlockButton from "./AddCodeBlockButton";

interface Props {
  addText: Function;
}

const useStyles = makeStyles(theme => ({
  toolbar: {
    marginTop: "3px",
    marginBottom: "2px"
  },
  hideOnMobile: {
    [theme.breakpoints.down("xs")]: {
      display: "none"
    }
  }
}));

const TextToolbar: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={1} className={classes.toolbar}>
      <Grid item className={classes.hideOnMobile}>
        <AddEmojiButton addText={props.addText} />
      </Grid>
      <Grid item>
        <AddImageButton addText={props.addText} />
      </Grid>
      <Grid item>
        <AddCodeBlockButton addText={props.addText} />
      </Grid>
    </Grid>
  );
};

export default TextToolbar;
