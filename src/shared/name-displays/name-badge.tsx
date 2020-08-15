import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles, Typography, createStyles, Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useTheme } from '@material-ui/styles';
import ApplicationState from '../../core/application-state';
import { isUserRepresentative } from '../util/user-util';
import {
  COLOR_ORANGE,
  COLOR_STEEL_BLUE,
  COLOR_CHROMIA_DARK,
  COLOR_OFF_WHITE,
  COLOR_CHROMIA_DARKER,
  COLOR_SOFT_PINK,
} from '../../theme';
import { isBright } from '../util/util';
import { getUserSettingsCached } from '../../core/services/user-service';

interface Props {
  name: string;
  styleId?: string;
  representatives: string[];
}

enum BadgeIdentifier {
  DARK = 'NameColoring:Dark',
  LIGHT = 'NameColoring:Light',
  BLUE = 'NameColoring:Blue',
  PINK_BORDERED = 'NameColoring:PinkBordered',
  REP = 'Representative',
}

const badgeBackgroundColor = (id: string, theme: Theme) => {
  switch (id) {
    case BadgeIdentifier.DARK:
      return COLOR_CHROMIA_DARKER;
    case BadgeIdentifier.LIGHT:
      return COLOR_OFF_WHITE;
    case BadgeIdentifier.BLUE:
      return COLOR_STEEL_BLUE;
    case BadgeIdentifier.PINK_BORDERED:
      return COLOR_SOFT_PINK;
    case BadgeIdentifier.REP:
      return COLOR_ORANGE;
    default:
      return theme.palette.secondary.main;
  }
};

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
      backgroundColor: badgeBackgroundColor(BadgeIdentifier.REP, theme),
    },
    darkColor: {
      backgroundColor: badgeBackgroundColor(BadgeIdentifier.DARK, theme),
    },
    pinkBordered: {
      backgroundColor: badgeBackgroundColor(BadgeIdentifier.PINK_BORDERED, theme),
      borderLeft: 'dashed 1px',
      borderBottom: 'dashed 1px',
      borderLeftColor: COLOR_CHROMIA_DARKER,
      borderBottomColor: COLOR_CHROMIA_DARK,
    },
    lightColor: {
      backgroundColor: badgeBackgroundColor(BadgeIdentifier.LIGHT, theme),
    },
    blueColor: {
      backgroundColor: badgeBackgroundColor(BadgeIdentifier.BLUE, theme),
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

  function getBadgeStyle(): string {
    if (!props.styleId && isUserRepresentative(props.name, props.representatives)) return classes.repColor;

    switch (getStyleIdentifier()) {
      case BadgeIdentifier.DARK:
        return classes.darkColor;
      case BadgeIdentifier.BLUE:
        return classes.blueColor;
      case BadgeIdentifier.LIGHT:
        return classes.lightColor;
      case BadgeIdentifier.PINK_BORDERED:
        return classes.pinkBordered;
      case BadgeIdentifier.REP:
        return classes.repColor;
      default:
        return classes.userColor;
    }
  }

  function TypographyWrapper(attributes: any): JSX.Element {
    if (props.styleId != null) {
      return <div className={`${classes.authorLink} ${classes.preview} ${getBadgeStyle()}`}>{attributes.children}</div>;
    }

    return (
      <Link className={`${classes.authorLink} ${classes.floatRight} ${getBadgeStyle()}`} to={`/u/${props.name}`}>
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
        style={{
          color: isBright(badgeBackgroundColor(getStyleIdentifier(), theme)) ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE,
        }}
      >
        <span
          style={{
            color: isBright(badgeBackgroundColor(getStyleIdentifier(), theme)) ? COLOR_CHROMIA_DARK : COLOR_OFF_WHITE,
          }}
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
