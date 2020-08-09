import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { MenuItem, ListItemIcon, Typography } from '@material-ui/core';
import CategoryIcon from '@material-ui/icons/Category';
import { loadStoreCategories, switchCategory } from '../redux/store-actions';
import ApplicationState from '../../../core/application-state';

interface Props {
  categories: string[];
  loadStoreCategories: typeof loadStoreCategories;
  switchCategory: typeof switchCategory;
}

const StoreCategories: React.FunctionComponent<Props> = (props) => {
  useEffect(() => {
    props.loadStoreCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!props.categories) return null;

  return (
    <>
      {props.categories.map((category) => (
        <MenuItem onClick={() => props.switchCategory(category)}>
          <ListItemIcon>
            <CategoryIcon />
          </ListItemIcon>
          <Typography>{category}</Typography>
        </MenuItem>
      ))}
    </>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    categories: store.store.storeCategories,
  };
};

const mapDispatchToProps = {
  loadStoreCategories,
  switchCategory,
};

export default connect(mapStateToProps, mapDispatchToProps)(StoreCategories);
