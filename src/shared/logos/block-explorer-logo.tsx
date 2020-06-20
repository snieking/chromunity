import React from 'react';
import WidgetsIcon from '@material-ui/icons/Widgets';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Tooltip } from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import * as config from '../../config';
import { COLOR_OFF_WHITE, COLOR_STEEL_BLUE } from '../../theme';

const useStyles = makeStyles({
  icon: {
    marginLeft: '2px',
    marginRight: '2px',
    cursor: 'pointer',
  },
  lightTheme: {
    color: COLOR_STEEL_BLUE,
  },
  darkTheme: {
    color: COLOR_OFF_WHITE,
  },
});

const BlockExplorerLogo: React.FunctionComponent = () => {
  const classes = useStyles();
  const theme = useTheme();

  const isDarkTheme = theme.palette.type === 'dark';

  return (
    <Tooltip title="Block Explorer">
      <WidgetsIcon
        className={`${classes.icon} ${isDarkTheme ? classes.darkTheme : classes.lightTheme}`}
        onClick={() => {
          window.location.href = `${config.blockchain.explorerBaseUrl + config.blockchain.rid}`;
        }}
      />
    </Tooltip>
  );
};

export default BlockExplorerLogo;
