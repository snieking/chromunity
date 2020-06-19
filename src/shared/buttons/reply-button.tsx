import React from "react";
import { Button, makeStyles } from "@material-ui/core";
import ApplicationState from "../../core/application-state";
import { connect } from "react-redux";

interface Props {
  size: "small" | "medium" | "large";
  toggled: boolean;
  onClick: Function;
  rateLimited: boolean;
}

const useStyles = makeStyles({
  buttonWrapper: {
    marginLeft: "auto",
    marginRight: "5px",
  },
});

const ReplyButton: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.buttonWrapper}>
        <Button
          color={"primary"}
          variant={props.toggled ? "contained" : "outlined"}
          size={props.size}
          onClick={() => props.onClick()}
          disabled={props.rateLimited}
        >
          {props.toggled ? "Hide" : "Reply"}
        </Button>
      </div>
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    rateLimited: store.common.rateLimited,
  };
};

export default connect(mapStateToProps)(ReplyButton);
