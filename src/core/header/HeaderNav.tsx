import React, { useEffect } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { LocationCity } from "@material-ui/icons";

import { ApplicationState } from "../store";
import { connect } from "react-redux";
import Badge from "@material-ui/core/Badge";
import { countUnreadChatsAction } from "../../features/chat/redux/chatActions";
import { ChromunityUser, RepresentativeReport } from "../../types";
import { toLowerCase, useInterval } from "../../shared/util/util";
import { retrieveLogbookLastRead, retrieveReportsLastRead } from "../services/RepresentativesService";
import {
  checkActiveElection,
  checkNewLogbookEntries,
  loadRepresentatives,
  loadReports,
} from "../../features/governing/redux/govActions";
import ProfileNavigation from "./ProfileNavigation";
import MobileWallNavigation from "./MobileWallNavigation";
import DesktopWallNavigation from "./DesktopWallNavigation";
import TestInfoBar from "./TestInfoBar";
import GovMenu from "./GovMenu";
import ChromiaLogo from "./ChromiaLogo";
import { autoLogin } from "../../features/user/redux/accountActions";

interface Props {
  representatives: string[];
  reports: RepresentativeReport[];
  activeElection: boolean;
  unreadChats: number;
  recentLogbookEntryTimestamp: number;
  user: ChromunityUser;
  autoLogin: typeof autoLogin;
  loadRepresentatives: typeof loadRepresentatives;
  loadReports: typeof loadReports;
  checkActiveElection: typeof checkActiveElection;
  countUnreadChats: typeof countUnreadChatsAction;
  checkNewLogbookEntries: typeof checkNewLogbookEntries;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    testInfo: {
      textAlign: "center",
    },
    desktopWallNav: {
      display: "inherit",
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
    mobileWallNav: {
      display: "inherit",
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
    navIcon: {
      color: theme.palette.primary.main,
    },
    grow: {
      flexGrow: 1,
    },
    leftMenuButton: {
      [theme.breakpoints.up("sm")]: {
        marginRight: theme.spacing(1),
      },
      [theme.breakpoints.up("md")]: {
        marginRight: theme.spacing(2),
      },
      [theme.breakpoints.up("lg")]: {
        marginRight: theme.spacing(3),
      },
    },
    rightMenuButton: {
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1),
      },
      [theme.breakpoints.up("md")]: {
        marginLeft: theme.spacing(2),
      },
      [theme.breakpoints.up("lg")]: {
        marginLeft: theme.spacing(3),
      },
    },
    inputRoot: {
      color: "inherit",
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: 200,
      },
    },
    leftGroup: {
      float: "left",
      display: "flex",
      width: "40%",
      [theme.breakpoints.down("sm")]: {
        width: "50%",
      },
    },
    middleGroup: {
      textAlign: "center",
      float: "none",
      width: "0%",
      [theme.breakpoints.up("md")]: {
        width: "20%",
      },
    },
    logo: {
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "block",
      },
    },
    rightGroup: {
      width: "40%",
      float: "right",
      [theme.breakpoints.down("sm")]: {
        width: "50%",
      },
    },
    profileMenu: {
      float: "right",
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
    }
    // eslint-disable-next-line
  }, [props.user]);

  useEffect(() => {
    if (isRepresentative()) {
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

  function isRepresentative() {
    return (
      props.user != null && props.user.name != null && props.representatives.includes(toLowerCase(props.user.name))
    );
  }

  function renderGovernmentIcon() {
    if (!props.activeElection && isRepresentative()) {
      return (
        <Badge
          invisible={
            (props.reports.length > 0 && props.reports[0].timestamp > retrieveReportsLastRead()) ||
            props.recentLogbookEntryTimestamp < retrieveLogbookLastRead()
          }
          color="secondary"
        >
          <LocationCity className={classes.navIcon} />
        </Badge>
      );
    } else {
      return (
        <Badge invisible={!props.activeElection} color="secondary">
          <LocationCity className={classes.navIcon} />
        </Badge>
      );
    }
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
              isRepresentative={isRepresentative}
              activeElection={props.activeElection}
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
            <ProfileNavigation user={props.user} classes={classes} unreadChats={props.unreadChats} />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    reports: store.government.reports,
    activeElection: store.government.activeElection,
    unreadChats: store.chat.unreadChats,
    recentLogbookEntryTimestamp: store.government.recentLogbookEntryTimestamp,
    user: store.account.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    checkActiveElection: (user: ChromunityUser) => dispatch(checkActiveElection(user)),
    checkNewLogbookEntries: (user: ChromunityUser) => dispatch(checkNewLogbookEntries(user)),
    countUnreadChats: (user: ChromunityUser) => dispatch(countUnreadChatsAction(user)),
    loadRepresentatives: () => dispatch(loadRepresentatives()),
    loadReports: () => dispatch(loadReports()),
    autoLogin: () => dispatch(autoLogin()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderNav);
