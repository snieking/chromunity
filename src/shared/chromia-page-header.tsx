import React from 'react';
import { createStyles, Theme, Typography } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      textAlign: 'center',
      marginBottom: '10px',
    },
    text: {
      [theme.breakpoints.down('md')]: {
        fontSize: '22px',
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: '18px',
      },
    },
  })
);

interface ChromiaHeaderProps {
  text: string;
}

const ChromiaPageHeader: React.FunctionComponent<ChromiaHeaderProps> = (props: ChromiaHeaderProps) => {
  const classes = useStyles(props);
  return (
    <div className={classes.header}>
      <Typography variant="h5" component="h5" className={classes.text}>
        {props.text}
      </Typography>
    </div>
  );
};

export default ChromiaPageHeader;
