import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';
import { ChromunityUser } from '../../types';
import ApplicationState from '../../core/application-state';
import StoreMenu from './menu/store-menu';
import StoreContent from './store-content';
import { loadOwnedItems } from './redux/store-actions';

interface Props {
  autoLoginInProgress: boolean;
  user: ChromunityUser;
  loadOwnedItems: typeof loadOwnedItems;
}

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const Store: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  useEffect(() => {
    if (props.user) {
      props.loadOwnedItems(props.user);
    }
  }, [props]);

  if (!props.autoLoginInProgress && !props.user) {
    window.location.replace('/user/login');
  }

  return (
    <Grid container className={classes.root} spacing={2}>
      <Grid item md={2} xs={12}>
        <Grid container justify="center" spacing={1}>
          <StoreMenu />
        </Grid>
      </Grid>
      <Grid item md={9} xs={12}>
        <Grid container justify="center" spacing={1}>
          <StoreContent />
        </Grid>
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    autoLoginInProgress: store.account.autoLoginInProgress,
  };
};

const mapDispatchToProps = {
  loadOwnedItems,
};

export default connect(mapStateToProps, mapDispatchToProps)(Store);
