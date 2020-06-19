import React from "react";
import { Theme } from "@material-ui/core";
import { connect } from "react-redux";
import ApplicationState from "./application-state";
import { toggleTheme } from "./dynamic-theme/redux/stylingActions";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Typography from "@material-ui/core/Typography";
import { ColorLens } from "@material-ui/icons";

interface Props {
  theme: Theme;
  toggleTheme: typeof toggleTheme;
}

const ThemeSwitcher: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <MenuItem onClick={props.toggleTheme}>
      <ListItemIcon>
        <ColorLens />
      </ListItemIcon>
      <Typography>{props.theme.palette.type === "dark" ? "Light theme" : "Dark theme"}</Typography>
    </MenuItem>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    theme: store.styling.theme
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    toggleTheme: () => dispatch(toggleTheme())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ThemeSwitcher);
