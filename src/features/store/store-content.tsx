import React from 'react';
import { connect } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';
import ApplicationState from '../../core/application-state';
import { StoreItem } from './store.model';
import StoreItemCard from './store-item-card';
import ChromiaPageHeader from '../../shared/chromia-page-header';

interface Props {
  category: string;
  storeItems: StoreItem[];
}

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const StoreContent: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  const renderItem = (item: StoreItem) => {
    return (
      <Grid key={item.name} item md={3} sm={4} xs={12}>
        <StoreItemCard item={item} isOnAuction={props.category !== 'My Items'} />
      </Grid>
    );
  };

  return (
    <>
      <ChromiaPageHeader text={props.category} />
      <Grid container justify="center" className={classes.root} spacing={1}>
        {props.storeItems.map((i) => renderItem(i))}
      </Grid>
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    category: state.store.category,
    storeItems: state.store.storeItems,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(StoreContent);
