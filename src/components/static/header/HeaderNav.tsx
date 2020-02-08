import React, { useEffect } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { LocationCity } from "@material-ui/icons";

import { getUser } from "../../../util/user-util";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import Badge from "@material-ui/core/Badge";
import { countUnreadChatsAction } from "../../chat/redux/chatActions";
import { ChromunityUser } from "../../../types";
import { toLowerCase, useInterval } from "../../../util/util";
import { retrieveLogbookLastRead } from "../../../blockchain/RepresentativesService";
import {
  checkActiveElection,
  checkNewLogbookEntries,
  loadRepresentatives,
  loadUnhandledReports
} from "../../governing/redux/govActions";
import ProfileNavigation from "./ProfileNavigation";
import MobileWallNavigation from "./MobileWallNavigation";
import DesktopWallNavigation from "./DesktopWallNavigation";
import TestInfoBar from "./TestInfoBar";
import GovMenu from "./GovMenu";
import ChromiaLogo from "./ChromiaLogo";

interface Props {
  representatives: string[];
  unhandledReports: number;
  activeElection: boolean;
  unreadChats: number;
  recentLogbookEntryTimestamp: number;
  loadRepresentatives: typeof loadRepresentatives;
  loadUnhandledReports: typeof loadUnhandledReports;
  checkActiveElection: typeof checkActiveElection;
  countUnreadChats: typeof countUnreadChatsAction;
  checkNewLogbookEntries: typeof checkNewLogbookEntries;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    testInfo: {
      textAlign: "center"
    },
    desktopWallNav: {
      display: "inherit",
      [theme.breakpoints.down("sm")]: {
        display: "none"
      }
    },
    mobileWallNav: {
      display: "inherit",
      [theme.breakpoints.up("md")]: {
        display: "none"
      }
    },
    navIcon: {
      color: theme.palette.primary.main
    },
    grow: {
      flexGrow: 1
    },
    leftMenuButton: {
      [theme.breakpoints.up("sm")]: {
        marginRight: theme.spacing(1)
      },
      [theme.breakpoints.up("md")]: {
        marginRight: theme.spacing(2)
      },
      [theme.breakpoints.up("lg")]: {
        marginRight: theme.spacing(3)
      }
    },
    rightMenuButton: {
      [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1)
      },
      [theme.breakpoints.up("md")]: {
        marginLeft: theme.spacing(2)
      },
      [theme.breakpoints.up("lg")]: {
        marginLeft: theme.spacing(3)
      }
    },
    inputRoot: {
      color: "inherit"
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: 200
      }
    },
    leftGroup: {
      float: "left",
      display: "flex",
      width: "40%",
      [theme.breakpoints.down("sm")]: {
        width: "50%"
      }
    },
    middleGroup: {
      textAlign: "center",
      float: "none",
      width: "0%",
      [theme.breakpoints.up("md")]: {
        width: "20%"
      }
    },
    logo: {
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "block"
      }
    },
    rightGroup: {
      width: "40%",
      float: "right",
      [theme.breakpoints.down("sm")]: {
        width: "50%"
      }
    },
    profileMenu: {
      float: "right"
    }
  })
);

const HeaderNav: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);
  const user = getUser();

  const [govAnchorEl, setGovAnchorEl] = React.useState<null | HTMLElement>(null);

  useInterval(() => {
    props.countUnreadChats(user);
  }, 30000);

  useEffect(() => {
    props.loadRepresentatives();

    if (user != null) {
      props.checkActiveElection(user);
    }
  }, [user, props]);

  useEffect(() => {
    if (isRepresentative()) {
      props.loadUnhandledReports();
      props.checkNewLogbookEntries(user);
    }
    // eslint-disable-next-line
  }, [props.representatives, props, user]);

  function handleGovClick(event: React.MouseEvent<HTMLButtonElement>) {
    setGovAnchorEl(event.currentTarget);
  }

  function handleGovClose() {
    setGovAnchorEl(null);
  }

  function isRepresentative() {
    return user != null && props.representatives.includes(toLowerCase(user.name));
  }

  function renderGovernmentIcon() {
    if (isRepresentative()) {
      return (
        <Badge
          invisible={props.unhandledReports < 1 || props.recentLogbookEntryTimestamp <= retrieveLogbookLastRead()}
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
              user={user}
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
              unhandledReports={props.unhandledReports}
            />
          </div>
          <div className={classes.middleGroup}>
            <div className={classes.logo}>
              <ChromiaLogo />
            </div>
          </div>
          <div className={classes.rightGroup}>
            <ProfileNavigation user={user} classes={classes} unreadChats={props.unreadChats} />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    representatives: store.government.representatives.map(rep => toLowerCase(rep)),
    unhandledReports: store.government.unhandledReports,
    loadUnhandledReports: store.government.unhandledReports,
    activeElection: store.government.activeElection,
    unreadChats: store.chat.unreadChats,
    recentLogbookEntryTimestamp: store.government.recentLogbookEntryTimestamp
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    checkActiveElection: (user: ChromunityUser) => dispatch(checkActiveElection(user)),
    checkNewLogbookEntries: (user: ChromunityUser) => dispatch(checkNewLogbookEntries(user)),
    countUnreadChats: (user: ChromunityUser) => dispatch(countUnreadChatsAction(user)),
    loadRepresentatives: () => dispatch(loadRepresentatives()),
    loadUnhandledReports: () => dispatch(loadUnhandledReports())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderNav);
