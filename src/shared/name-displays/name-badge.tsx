import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles, Typography, createStyles, Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useTheme } from '@material-ui/styles';
import ApplicationState from '../../core/application-state';
import { isUserRepresentative } from '../util/user-util';
import { COLOR_ORANGE, COLOR_STEEL_BLUE, COLOR_CHROMIA_DARK, COLOR_OFF_WHITE, COLOR_CHROMIA_DARKER } from '../../theme';
import { isBright } from '../util/util';
import { getUserSettingsCached } from '../../core/services/user-service';

interface Props {
  name: string;
  styleId?: string;
  representatives: string[];
}

const useStyles = makeStyles((theme) =>
  createStyles({
    authorName: {
      display: 'block',
      paddingTop: '2px',
      paddingLeft: '5px',
      paddingRight: '5px',
    },
    authorLink: {
      borderRadius: '0 0 0 5px',
      marginTop: '-18px',
      marginBottom: '7px',
      marginRight: '-16px',
    },
    preview: {
      display: 'inline-block',
    },
    floatRight: {
      float: 'right',
    },
    userColor: {
      backgroundColor: theme.palette.secondary.main,
    },
    repColor: {
      backgroundColor: COLOR_ORANGE,
    },
    darkColor: {
      backgroundColor: 'black',
    },
    lightColor: {
      backgroundColor: '#FFF',
    },
    blueColor: {
      backgroundColor: COLOR_STEEL_BLUE,
    },
  })
);

const NameBadge: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  const theme: Theme = useTheme();
  const [nameBadgeId, setNameBadgeId] = useState('');

  useEffect(() => {
    if (props.name) {
      getUserSettingsCached(props.name, 600).then((settings) => setNameBadgeId(settings.name_badge_id));
    }
  }, [props.name]);

  function getStyleIdentifier() {
    return props.styleId || nameBadgeId;
  }

  function getBackgroundColor(): string {
    if (!props.styleId && isUserRepresentative(props.name, props.representatives)) return classes.repColor;
    if (getStyleIdentifier() === 'NameColoring:Dark') return COLOR_CHROMIA_DARKER;
    if (getStyleIdentifier() === 'NameColoring:Blue') return COLOR_STEEL_BLUE;
    if (getStyleIdentifier() === 'NameColoring:Light') return '#FFFFFF';

    return theme.palette.secondary.main;
  }

  function TypographyWrapper(attributes: any): JSX.Element {
    if (props.styleId != null) {
      return (
        <div className={`${classes.authorLink} ${classes.preview}`} style={{ backgroundColor: getBackgroundColor() }}>
          {attributes.children}
        </div>
      );
    }

    return (
      <Link
        className={`${classes.authorLink} ${classes.floatRight}`}
        style={{ backgroundColor: getBackgroundColor() }}
        to={`/u/${props.name}`}
      >
        {attributes.children}
      </Link>
    );
  }

  return (
    <TypographyWrapper>
      <Typography
        gutterBottom
        variant="subtitle1"
        component="span"
        className="typography"
        style={{ color: isBright(getBackgroundColor()) ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE }}
      >
        <span
          style={{ color: isBright(getBackgroundColor()) ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE }}
          className={classes.authorName}
        >
          @{props.name}
        </span>
      </Typography>
    </TypographyWrapper>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives,
  };
};

export default connect(mapStateToProps)(NameBadge);
