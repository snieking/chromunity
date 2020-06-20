import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ChromiaPageHeader from '../../shared/chromia-page-header';

const useStyles = makeStyles({
  text: {
    textAlign: 'center',
  },
});

export const ErrorPage: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <>
      <ChromiaPageHeader text="Woops... Something went wrong!" />
      <p className={classes.text}>The incident has been reported and will be looked at.</p>
    </>
  );
};
