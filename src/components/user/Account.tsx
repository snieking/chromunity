import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { createStyles } from "@material-ui/core";
import {EncryptedAccount} from "../../types";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import WalletIcon from '@material-ui/icons/AccountBalanceWallet'
import ListItemText from "@material-ui/core/ListItemText";

const useStyles = makeStyles(createStyles({
  text: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  }
}));

interface Props {
  account: EncryptedAccount;
  selectedAccount: EncryptedAccount;
  setSelectedAccount: Function;
}

const Account: React.FunctionComponent<Props> = props => {
  const classes = useStyles(props);

  const handleClick = () => {
    props.setSelectedAccount(props.account);
  };

  return (
    <>
      <ListItem
        button
        divider
        selected={props.account === props.selectedAccount}
        onClick={handleClick}
      >
        <ListItemAvatar>
            <WalletIcon />
        </ListItemAvatar>
        <ListItemText
          primary={props.account.name || ""}
          secondary={props.account.encryptedSeed || ""}
          className={classes.text}
        />
      </ListItem>
    </>
  );
};

export default Account;
