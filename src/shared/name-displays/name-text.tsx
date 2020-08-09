import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, makeStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { isUserRepresentative } from '../util/user-util';
import { COLOR_ORANGE } from '../../theme';
import ApplicationState from '../../core/application-state';

interface Props {
  name: string;
  representatives: string[];
}

const useStyles = makeStyles({
  representativeColor: {
    color: COLOR_ORANGE,
  },
  authorName: {
    display: 'block',
    marginTop: '10px',
    marginRight: '10px',
    marginLeft: '5px',
  },
});

const NameText: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();

  return (
    <Link to={`/u/${props.name}`}>
      <Typography
        gutterBottom
        variant="subtitle2"
        component="span"
        className={isUserRepresentative(props.name, props.representatives) ? classes.representativeColor : ''}
      >
        <span className={classes.authorName}>@{props.name}</span>
      </Typography>
    </Link>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives,
  };
};

export default connect(mapStateToProps)(NameText);
