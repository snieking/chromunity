import React from "react";
import { Button, makeStyles } from "@material-ui/core";

interface Props {
  size: "small" | "medium" | "large";
  toggled: boolean;
  onClick: Function;
}

const useStyles = makeStyles({
  buttonWrapper: {
    marginLeft: "auto",
    marginRight: "5px"
  }
});

const ReplyButton: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.buttonWrapper}>
        <Button color={"primary"} variant={props.toggled ? "contained" : "outlined"} size={props.size} onClick={() => props.onClick()}>
          {props.toggled ? "Hide" : "Reply"}
        </Button>
      </div>
    </>
  );
};

export default ReplyButton;
