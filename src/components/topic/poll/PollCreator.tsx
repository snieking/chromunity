import React, { useState } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import IconButton from "@material-ui/core/IconButton";
import { COLOR_RED } from "../../../theme";
import { PollSpecification } from "../../../types";

interface Props {
  poll: PollSpecification;
}

const useStyles = makeStyles(theme => ({
  question: {
    marginTop: "10px",
    marginBottom: "5px"
  },
  optionWrapper: {
    marginTop: "1px",
    display: "inline"
  },
  textField: {
    width: "80%"
  },
  actions: {
    display: "inline"
  }
}));

const MAX_OPTIONS = 4;
const MIN_OPTIONS = 2;

const PollCreator: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  const [counter, setCounter] = useState(MIN_OPTIONS);

  function incrementCounter() {
    if (counter < MAX_OPTIONS) {
      setCounter(counter + 1);
    }
  }

  function decrementCounter() {
    if (counter > MIN_OPTIONS) {
      props.poll.options = props.poll.options.slice(0, counter - 1);
      setCounter(counter - 1);
    }
  }

  function questionChange(text: string) {
    props.poll.question = text;
  }

  function optionChange(index: number, text: string) {
    if (props.poll.options == null) {
      props.poll.options = new Array<string>();
    }

    props.poll.options[index] = text;
  }

  function renderOptions() {
    const toRender = [];
    for (let i = 1; i <= counter; i++) {
      toRender.push(
        <Grid item xs={12} className={classes.optionWrapper} key={"opt-" + i}>
          <TextField
            label={"Option " + i}
            type="text"
            color="secondary"
            variant="outlined"
            className={classes.textField}
            onChange={event => optionChange(i - 1, event.target.value)}
          />
          {counter === i && counter > MIN_OPTIONS && (
            <IconButton onClick={decrementCounter} className={classes.actions}>
              <RemoveCircleIcon color="inherit" style={{ color: COLOR_RED }} />
            </IconButton>
          )}
          {counter === i && counter < MAX_OPTIONS && (
            <IconButton onClick={incrementCounter} className={classes.actions}>
              <AddCircleIcon />
            </IconButton>
          )}
        </Grid>
      );
    }

    return toRender;
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12} className={classes.question}>
          <TextField
            label="Question"
            variant="outlined"
            className={classes.textField}
            onChange={event => questionChange(event.target.value)}
          />
        </Grid>
        {renderOptions()}
      </Grid>
    </>
  );
};

export default PollCreator;
