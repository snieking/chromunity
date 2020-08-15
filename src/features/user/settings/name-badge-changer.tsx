import React, { useState, useEffect } from 'react';
import { Grid, Select, makeStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import NameBadge from '../../../shared/name-displays/name-badge';
import { StoreItem } from '../../store/store.model';
import { ChromunityUser } from '../../../types';
import { getOwnedItemsByCategory } from '../../store/store.service';
import ApplicationState from '../../../core/application-state';

interface Props {
  nameBadgeId: string;
  updateNameBadgeId: (value: string) => void;
  user: ChromunityUser;
}

const useStyles = makeStyles({
  wrapper: {
    marginTop: '10px',
    marginBottom: '15px',
  },
  item: {
    textAlign: 'center',
  },
});

const NameBadgeChanger: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  const [items, setItems] = useState<StoreItem[]>([]);

  useEffect(() => {
    if (props.user) {
      getOwnedItemsByCategory(props.user, 'Name Coloring').then((i) => setItems(i));
    }
  }, [props.user]);

  function dropdownMenu() {
    return (
      <Select
        native
        value={props.nameBadgeId}
        onChange={(event) => props.updateNameBadgeId(event.target.value as string)}
        inputProps={{
          name: 'styleId',
          id: 'styleId-simple',
        }}
        style={{ margin: '0 auto' }}
      >
        <option aria-label="Default" value="[default]">
          Default
        </option>
        {items.map((i) => (
          <option aria-label={i.id} value={i.id} key={i.id}>
            {i.name}
          </option>
        ))}
      </Select>
    );
  }

  if (!props.user) return null;

  return (
    <>
      <Grid container className={classes.wrapper}>
        <Grid item className={classes.item} xs={12} sm={6}>
          {dropdownMenu()}
        </Grid>
        <Grid item className={classes.item} xs={12} sm={6}>
          <NameBadge name={props.user.name} styleId={props.nameBadgeId} />
        </Grid>
      </Grid>
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => {
  return {
    user: state.account.user,
  };
};

export default connect(mapStateToProps)(NameBadgeChanger);
