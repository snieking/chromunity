import React, { useState } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { createStyles, Snackbar } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { equalValues, required, validate } from "../../../../util/validations";
import { CustomSnackbarContentWrapper } from "../../../common/CustomSnackbar";

const useStyles = makeStyles(
  createStyles({
    input: {
      marginTop: "10px",
      display: "block"
    }
  })
);

interface Props {
  onContinue: Function;
}

const AccountCredentialsForm: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [verifyPassword, setVerifyPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [errorOpen, setErrorOpen] = useState<boolean>(false);

  const handleContinueClick = () => {
    const validations = [
      [name, [required("Please pick a name")]],
      [password, [required("Please enter a valid password")]],
      [verifyPassword, [equalValues(password, "Passwords do not match")]]
    ];

    if (!validate(validations, setError)) {
      setErrorOpen(true);
      return;
    }

    props.onContinue(name, password);
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = event.target.name;
    const value = event.target.value;

    switch (name) {
      case "name":
        setName(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "verify-password":
        setVerifyPassword(value);
        break;
      default:
        console.warn("Invalid target name on handleTextFieldChange");
    }
  };

  return (
    <div>
      <Typography component="p" variant="subtitle1">
        The account will be stored locally on your device
      </Typography>

      <TextField
        label="Account name"
        name="name"
        type="text"
        fullWidth
        variant="outlined"
        onChange={handleTextFieldChange}
        className={classes.input}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        fullWidth
        variant="outlined"
        onChange={handleTextFieldChange}
        className={classes.input}
      />

      <TextField
        label="Verify password"
        name="verify-password"
        type="password"
        fullWidth
        variant="outlined"
        onChange={handleTextFieldChange}
        className={classes.input}
      />

      <Button
        onClick={() => handleContinueClick()}
        fullWidth
        color="primary"
        variant="contained"
        className={classes.input}
      >
        Continue
      </Button>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={errorOpen}
        autoHideDuration={6000}
      >
        <CustomSnackbarContentWrapper onClose={() => setErrorOpen(false)} variant="error" message={error} />
      </Snackbar>
    </div>
  );
};

export default AccountCredentialsForm;
