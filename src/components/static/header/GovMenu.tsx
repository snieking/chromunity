import React from "react";
import { Link } from "react-router-dom";
import { ListItemIcon, Menu, MenuItem, Typography } from "@material-ui/core";
import { Face, Gavel, HowToVote, Report } from "@material-ui/icons";
import Badge from "@material-ui/core/Badge/Badge";
import { retrieveLogbookLastRead } from "../../../blockchain/RepresentativesService";

interface Props {
  activeElection: boolean;
  recentLogbookEntryTimestamp: number;
  govAnchorEl: HTMLElement;
  handleGovClose: Function;
  unhandledReports: number;
  isRepresentative: () => boolean;
}

const GovMenu: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <Menu
      id="gov-menu"
      anchorEl={props.govAnchorEl}
      keepMounted
      open={Boolean(props.govAnchorEl)}
      onClose={() => props.handleGovClose()}
    >
      <Link style={{ width: "100%" }} to="/gov/representatives">
        <MenuItem onClick={() => props.handleGovClose()}>
          <ListItemIcon>
            <Face className="menu-item-button" />
          </ListItemIcon>
          <Typography className="menu-item-text">Representatives</Typography>
        </MenuItem>
      </Link>
      <br />
      <Link style={{ width: "100%" }} to="/gov/election">
        <MenuItem onClick={() => props.handleGovClose()}>
          <ListItemIcon>
            <Badge variant="dot" invisible={!props.activeElection} color="secondary">
              <HowToVote className="menu-item-button" />
            </Badge>
          </ListItemIcon>
          <Typography className="menu-item-text">Election</Typography>
        </MenuItem>
      </Link>
      <br />
      <Link style={{ width: "100%" }} to="/gov/log">
        <MenuItem onClick={() => props.handleGovClose()}>
          <ListItemIcon>
            <Badge
              variant="dot"
              invisible={props.recentLogbookEntryTimestamp <= retrieveLogbookLastRead()}
              color="secondary"
            >
              <Gavel className="menu-item-button" />
            </Badge>
          </ListItemIcon>
          <Typography className="menu-item-text">Log</Typography>
        </MenuItem>
      </Link>
      <br />
      <Link style={{ width: "100%" }} to="/gov/reports">
        <MenuItem onClick={() => props.handleGovClose()}>
          <ListItemIcon>
            <Badge badgeContent={props.isRepresentative() ? props.unhandledReports : 0} color="secondary">
              <Report className="menu-item-button" />
            </Badge>
          </ListItemIcon>
          <Typography className="menu-item-text">Reports</Typography>
        </MenuItem>
      </Link>
    </Menu>
  );
};

export default GovMenu;
