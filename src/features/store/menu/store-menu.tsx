import React from 'react';
import { connect } from 'react-redux';
import { MenuList, Typography, MenuItem, makeStyles, ListItemIcon, Theme, createStyles } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import ApplicationState from '../../../core/application-state';
import { loadStoreCategories, switchCategory, loadOwnedItems } from '../redux/store-actions';
import { COLOR_CHROMIA_DARK_LIGHTER, COLOR_CHROMIA_LIGHTER } from '../../../theme';
import { ChromunityUser } from '../../../types';
import StoreCategories from './store-categories';
import PriceSlider from './price-slider';

interface Props {
  categories: string[];
  user: ChromunityUser;
  loadStoreCategories: typeof loadStoreCategories;
  switchCategory: typeof switchCategory;
  loadOwnedItems: typeof loadOwnedItems;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menu: {
      [theme.breakpoints.up('lg')]: {
        marginTop: '42px',
      },
      [theme.breakpoints.down('md')]: {
        width: '80%',
        marginBottom: '20px',
      },
      paddingTop: '10px',
      border: 'solid 1px',
      borderColor: theme.palette.type === 'dark' ? COLOR_CHROMIA_DARK_LIGHTER : COLOR_CHROMIA_LIGHTER,
    },
    header: {
      marginLeft: '20px',
    },
  })
);

const StoreMenu: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.menu}>
      <Typography variant="subtitle1" component="p" className={classes.header}>
        Categories
      </Typography>
      <MenuList>
        <MenuItem onClick={() => props.loadOwnedItems(props.user)}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <Typography>My Items</Typography>
        </MenuItem>
        <StoreCategories />
      </MenuList>
      <Typography variant="subtitle1" component="p" className={classes.header}>
        Price range
      </Typography>
      <PriceSlider />
    </div>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    categories: store.store.storeCategories,
    user: store.account.user,
  };
};

const mapDispatchToProps = {
  loadStoreCategories,
  switchCategory,
  loadOwnedItems,
};

export default connect(mapStateToProps, mapDispatchToProps)(StoreMenu);
