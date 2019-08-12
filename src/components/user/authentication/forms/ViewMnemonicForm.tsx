import React from "react";
import {createStyles, TextField} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(createStyles({
  content: {
    textAlign: "center",
    margin: "0 auto"
  },
  row: {
    marginTop: "10px",
    display: "block"
  }
}));

interface Props {
  mnemonic: string;
  onContinue: Function;
}

const ViewMnemonicForm: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  return (
    <div className={classes.content}>
      <Typography component="p" variant="subtitle1">
        Please carefully write down these {props.mnemonic.split(" ").length} words and store them safely
      </Typography>
      <TextField rows="2" fullWidth multiline value={props.mnemonic} variant="outlined" className={classes.row}/>
      <Button
        fullWidth
        type="submit"
        color="primary"
        variant="contained"
        onClick={() => props.onContinue()}
        className={classes.row}
      >
        Continue
      </Button>
    </div>
  );
};

export default ViewMnemonicForm;
