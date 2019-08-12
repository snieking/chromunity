import React, { useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Chip, createStyles, Snackbar, TextField} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { COLOR_SOFT_PINK } from "../../../../theme";
import {equalValues, validate} from "../../../../util/validations";
import {CustomSnackbarContentWrapper} from "../../../common/CustomSnackbar";
import {shuffle} from "../../../../util/util";

const useStyles = makeStyles(
  createStyles({
    input: {
      display: "block",
      marginTop: "10px"
    },
    mnemonic: {
      margin: "1px"
    },
    clickedMnemonic: {
      backgroundColor: COLOR_SOFT_PINK,
      margin: "1px"
    }
  })
);

interface Props {
  mnemonic: string;
  onContinue: Function;
}

const VerifyMnemonicForm: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  const [seed, setSeed] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  const shuffledSeed = shuffle(props.mnemonic.split(" "));

  const isSelected = (word: string) => seed.includes(word);

  const generateMnemonicChip = (mnemonic: string) => {
    return (
      <Chip
        key={"mnemonic-" + mnemonic}
        label={mnemonic}
        clickable
        color={isSelected(mnemonic) ? "secondary" : "default"}
        onClick={() => updateClickedWords(mnemonic)}
        className={classes.mnemonic}
      />
    );
  };

  const updateClickedWords = (word: string) => {
    const updatedSeed: string[] = [];
    if (isSelected(word)) {
      seed.forEach((value: string) => {
        if (value !== word) {
          updatedSeed.push(value);
        }
      });
      setSeed(updatedSeed);
    } else {
      setSeed(seed.concat([word]));
    }
  };

  const verifyMnemonic = () => {
    const validations = [
      [seed.join(" "), [equalValues(props.mnemonic, "Words do not match")]]
    ];

    if (!validate(validations, setError)) {
      setErrorOpen(true);
      setSeed([]);
      return;
    }

    props.onContinue();
  };

  return (
    <div>
      <Typography component="p" variant="subtitle1" id="description">
        Verify backup phrase by clicking the words in the correct order
      </Typography>
      <TextField
        rows="2"
        fullWidth
        multiline
        value={seed.join(" ")}
        variant="outlined"
        className={classes.input}
        InputProps={{ readOnly: true }}
      />

      <div className={classes.input}>
        {shuffledSeed.map(mnemonic => generateMnemonicChip(mnemonic))}
      </div>

      <Button
        fullWidth
        type="submit"
        color="primary"
        variant="contained"
        onClick={verifyMnemonic}
        className={classes.input}
        disabled={seed.length !== props.mnemonic.split(" ").length}
      >
        Confirm
      </Button>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={errorOpen}
        autoHideDuration={6000}
        onClose={() => setErrorOpen(false)}
      >
        <CustomSnackbarContentWrapper variant="error" message={error} />
      </Snackbar>
    </div>
  );
};

export default VerifyMnemonicForm;
