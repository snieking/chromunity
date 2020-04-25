import React from "react";
import { createStyles, makeStyles } from "@material-ui/core";
import ChromiaPageHeader from "../../../../shared/ChromiaPageHeader";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import { ReactComponent as LeftShapes } from "../../../shared/graphics/left-shapes.svg";
import { ReactComponent as RightShapes } from "../../../shared/graphics/right-shapes.svg";
import { AuthenticationStep } from "../../redux/accountTypes";

const useStyles = makeStyles(theme =>
  createStyles({
    contentWrapper: {
      textAlign: "center",
      padding: "20px"
    },
    outerWrapper: {
      position: "relative"
    },
    innerWrapper: {
      maxWidth: "400px",
      margin: "0 auto"
    },
    input: {
      marginTop: "10px"
    },
    textField: {
      marginBottom: "5px"
    },
    leftShapes: {
      [theme.breakpoints.down("sm")]: {
        display: "none"
      },
      float: "left"
    },
    rightShapes: {
      [theme.breakpoints.down("sm")]: {
        display: "none"
      },
      float: "right"
    }
  })
);

interface Props {
  authenticationStep: AuthenticationStep;
  loading: boolean;
  login: () => void;
}

const VaultLoginPresentation: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  return (
    <Container maxWidth="md" className={classes.contentWrapper}>
      <ChromiaPageHeader text={"Login"} />
      {props.loading && <CircularProgress disableShrink />}
      {props.authenticationStep == null && (
        <div>
          <LeftShapes className={classes.leftShapes} />
          <RightShapes className={classes.rightShapes} />
          <div className={classes.innerWrapper}>
            <Typography variant="subtitle1" component="p" className={classes.textField}>
              User authentication is provided by the Chromia Vault
            </Typography>
            <Button color="primary" variant="contained" fullWidth className={classes.input} onClick={props.login}>
              Sign In with Vault
            </Button>
          </div>
        </div>
      )}
      {props.authenticationStep === AuthenticationStep.VAULT_IN_PROGRESS && (
        <Typography variant="subtitle1" component="p">
          Redirecting to Chromia Vault...
        </Typography>
      )}
    </Container>
  );
};

export default VaultLoginPresentation;
