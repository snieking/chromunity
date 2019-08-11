import React, { useState } from "react";
import { createStyles, TextField } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(
  createStyles({
    content: {
      textAlign: "center",
      margin: "0 auto"
    },
    row: {
      marginTop: "10px",
      display: "block"
    }
  })
);

interface Props {
  onContinue: Function;
}

const EnterSeedForm: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  const [seed, setSeed] = useState("");

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    setSeed(event.target.value);
  };

  const submit = () => {
    props.onContinue(seed);
  };

  return (
    <div className={classes.content}>
      <Typography component="p" variant="subtitle1">
        Please enter your backup phrase
      </Typography>
      <TextField
        rows="2"
        fullWidth
        multiline
        value={seed}
        onChange={handleTextFieldChange}
        variant="outlined"
        className={classes.row}
      />
      <Button
        fullWidth
        type="submit"
        color="primary"
        variant="contained"
        onClick={submit}
        className={classes.row}
      >
        Continue
      </Button>
    </div>
  );
};

export default EnterSeedForm;
