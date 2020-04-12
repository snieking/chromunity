import React from "react";
import * as config from "../../../config";
import WidgetsIcon from "@material-ui/icons/Widgets";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Tooltip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginLeft: "2px",
    marginRight: "2px",
    cursor: "pointer",
  },
}));

const BlockExplorerLogo: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Tooltip title="Block Explorer">
      <WidgetsIcon
        className={classes.icon}
        onClick={() => (window.location.href = `${config.blockchain.explorerBaseUrl + config.blockchain.rid}`)}
      />
    </Tooltip>
  );
};

export default BlockExplorerLogo;
