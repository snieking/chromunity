import React, { useEffect, useState } from "react";

import { Badge, createStyles, makeStyles, Tooltip } from "@material-ui/core";
import { Notifications, NotificationsActive } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import { countUnreadUserNotifications } from "../../core/services/notification-service";
import { ChromunityUser } from "../../types";
import ApplicationState from "../../core/application-state";
import { connect } from "react-redux";

export interface NotificationsButtonProps {
  username: string;
  user: ChromunityUser;
}

const useStyles = makeStyles(theme =>
  createStyles({
    navIcon: {
      color: theme.palette.primary.main
    }
  })
);

const NotificationsButton: React.FunctionComponent<NotificationsButtonProps> = props => {
  const classes = useStyles(props);
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    countUnreadUserNotifications(props.username)
      .then(count => setCounter(count))
      .catch(() => (window.location.href = "/user/logout"));
    // eslint-disable-next-line
  }, []);

  function render() {
    if (props.user != null) {
      return (
        <IconButton aria-label="Notifications" onClick={() => setCounter(0)}>
          <Badge color="secondary" badgeContent={counter}>
            <Tooltip title="Notifications">
              {counter > 0 ? (
                <NotificationsActive className={classes.navIcon} />
              ) : (
                <Notifications className={classes.navIcon} />
              )}
            </Tooltip>
          </Badge>
        </IconButton>
      );
    } else {
      return <div />;
    }
  }

  return render();
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(NotificationsButton);
