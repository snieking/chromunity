import React, { useEffect, useState } from "react";

import { Badge, createStyles, makeStyles, Tooltip } from "@material-ui/core";
import { Notifications, NotificationsActive } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import { countUnreadUserNotifications } from "../../blockchain/NotificationService";
import { getUser } from "../../util/user-util";

export interface NotificationsButtonProps {
  username: string;
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
  const user = getUser();

  useEffect(() => {
    countUnreadUserNotifications(props.username)
      .then(count => setCounter(count))
      .catch(() => setCounter(0));
    // eslint-disable-next-line
  }, []);

  function render() {
    if (user != null) {
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

export default NotificationsButton;
