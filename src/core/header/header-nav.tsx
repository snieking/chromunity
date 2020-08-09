import React, { useEffect } from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { LocationCity } from '@material-ui/icons';

import { connect } from 'react-redux';
import Badge from '@material-ui/core/Badge';
import ApplicationState from '../application-state';
import { countUnreadChats } from '../../features/chat/redux/chat-actions';
import { ChromunityUser, RepresentativeReport } from '../../types';
import { toLowerCase, useInterval } from '../../shared/util/util';
import { retrieveLogbookLastRead, retrieveReportsLastRead } from '../services/representatives-service';
import {
  checkActiveElection,
  checkNewLogbookEntries,
  loadRepresentatives,
  loadReports,
} from '../../features/governing/redux/gov-actions';
import ProfileNavigation from './profile-navigation';
import MobileWallNavigation from './mobile-wall-navigation';
import DesktopWallNavigation from './desktop-wall-navigation';
import TestInfoBar from './test-info-bar';
import GovMenu from './gov-menu';
import ChromiaLogo from './chromia-logo';
import { autoLogin, checkUserKudos } from '../../features/user/redux/account-actions';
import { isRepresentative } from '../../shared/util/user-util';
import { processAuctions, checkIsAuctionInProgress } from '../../features/store/redux/store-actions';

interface Props {
  representatives: string[];
  reports: RepresentativeReport[];
  activeElection: boolean;
  unreadChats: number;
  recentLogbookEntryTimestamp: number;
  user: ChromunityUser;
  kudos: number;
  auctionInProgress: boolean;
  autoLogin: typeof autoLogin;
  loadRepresentatives: typeof loadRepresentatives;
  loadReports: typeof loadReports;
  checkActiveElection: typeof checkActiveElection;
  countUnreadChats: typeof countUnreadChats;
  checkNewLogbookEntries: typeof checkNewLogbookEntries;
  checkUserKudos: typeof checkUserKudos;
  processAuctions: typeof processAuctions;
  checkIsAuctionInProgress: typeof checkIsAuctionInProgress;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    testInfo: {
      textAlign: 'center',
    },
    desktopWallNav: {
      display: 'inherit',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    mobileWallNav: {
      display: 'inherit',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    navIcon: {
      color: theme.palette.primary.main,
    },
    grow: {
      flexGrow: 1,
    },
    leftMenuButton: {
      [theme.breakpoints.up('sm')]: {
        marginRight: theme.spacing(1),
      },
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(2),
      },
      [theme.breakpoints.up('lg')]: {
        marginRight: theme.spacing(3),
      },
    },
    rightMenuButton: {
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
      },
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(2),
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: theme.spacing(3),
      },
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: 200,
      },
    },
    leftGroup: {
      float: 'left',
      display: 'flex',
      width: '40%',
      [theme.breakpoints.down('sm')]: {
        width: '50%',
      },
    },
    middleGroup: {
      textAlign: 'center',
      float: 'none',
      width: '0%',
      [theme.breakpoints.up('md')]: {
        width: '20%',
      },
    },
    logo: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'block',
      },
    },
    rightGroup: {
      width: '40%',
      float: 'right',
      [theme.breakpoints.down('sm')]: {
        width: '50%',
      },
    },
    profileMenu: {
      float: 'right',
    },
  })
);

const HeaderNav: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);

  const [govAnchorEl, setGovAnchorEl] = React.useState<null | HTMLElement>(null);

  useInterval(() => {
    props.countUnreadChats(props.user);
  }, 30000);

  useEffect(() => {
    if (!props.user) {
      props.autoLogin();
    }

    props.loadRepresentatives();
    props.loadReports();

    if (props.user != null) {
      props.checkActiveElection(props.user);
      props.checkUserKudos();
      props.processAuctions(props.user);
      props.checkIsAuctionInProgress();
    }
    // eslint-disable-next-line
  }, [props.user]);

  useEffect(() => {
    if (isRepresentative(props.user, props.representatives)) {
      props.checkNewLogbookEntries(props.user);
    }
    // eslint-disable-next-line
  }, [props.representatives, props]);

  function handleGovClick(event: React.MouseEvent<HTMLButtonElement>) {
    setGovAnchorEl(event.currentTarget);
  }

  function handleGovClose() {
    setGovAnchorEl(null);
  }

  function renderGovernmentIcon() {
    if (!props.activeElection && isRepresentative(props.user, props.representatives)) {
      return (
        <Badge
          invisible={
            ((props.reports.length > 0 && props.reports[0].timestamp > retrieveReportsLastRead()) ||
              props.recentLogbookEntryTimestamp < retrieveLogbookLastRead()) &&
            !props.auctionInProgress
          }
          color="secondary"
        >
          <LocationCity className={classes.navIcon} />
        </Badge>
      );
    }
    return (
      <Badge invisible={!props.activeElection} color="secondary">
        <LocationCity className={classes.navIcon} />
      </Badge>
    );
  }

  return (
    <div className={classes.grow}>
      <TestInfoBar classes={classes} />
      <AppBar position="static">
        <Toolbar>
          <div className={classes.leftGroup}>
            <DesktopWallNavigation
              user={props.user}
              classes={classes}
              handleGovClick={handleGovClick}
              renderGovernmentIcon={renderGovernmentIcon}
            />
            <MobileWallNavigation
              classes={classes}
              handleGovClick={handleGovClick}
              renderGovernmentIcon={renderGovernmentIcon}
            />
            <GovMenu
              govAnchorEl={govAnchorEl}
              handleGovClose={handleGovClose}
              isRepresentative={isRepresentative(props.user, props.representatives)}
              activeElection={props.activeElection}
              auctionInProgress={props.auctionInProgress}
              recentLogbookEntryTimestamp={props.recentLogbookEntryTimestamp}
              recentReportEntryTimestamp={
                props.reports != null && props.reports.length > 0 ? props.reports[0].timestamp : 0
              }
            />
          </div>
          <div className={classes.middleGroup}>
            <div className={classes.logo}>
              <ChromiaLogo />
            </div>
          </div>
          <div className={classes.rightGroup}>
            <ProfileNavigation
              user={props.user}
              classes={classes}
              unreadChats={props.unreadChats}
              kudos={props.kudos}
            />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

const mapDispatch = {
  checkActiveElection,
  checkNewLogbookEntries,
  loadRepresentatives,
  loadReports,
  countUnreadChats,
  autoLogin,
  checkUserKudos,
  processAuctions,
  checkIsAuctionInProgress,
};

const mapState = (state: ApplicationState) => {
  return {
    representatives: state.government.representatives.map((rep) => toLowerCase(rep)),
    reports: state.government.reports,
    activeElection: state.government.activeElection,
    unreadChats: state.chat.unreadChats,
    recentLogbookEntryTimestamp: state.government.recentLogbookEntryTimestamp,
    user: state.account.user,
    kudos: state.account.kudos,
    auctionInProgress: state.store.auctionInProgress,
  };
};

export default connect(mapState, mapDispatch)(HeaderNav);
