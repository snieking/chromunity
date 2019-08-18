import React, { useEffect, useState } from "react";

import { Badge, createStyles, makeStyles, Tooltip } from "@material-ui/core";
import { Notifications, NotificationsActive } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import { countUnreadUserNotifications } from "../../blockchain/NotificationService";
import { getAuthorizedUser } from "../../util/user-util";
import { COLOR_SOFT_PINK } from "../../theme";

export interface NotificationsButtonProps {
  username: string;
}

const useStyles = makeStyles(
  createStyles({
    navIcon: {
      color: COLOR_SOFT_PINK
    }
  })
);

const NotificationsButton: React.FunctionComponent<
  NotificationsButtonProps
> = props => {
  const classes = useStyles(props);
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    countUnreadUserNotifications(props.username).then(count =>
      setCounter(count)
    );
    // eslint-disable-next-line
  }, []);

  function render() {
    if (getAuthorizedUser() != null) {
      return (
        <IconButton aria-label="Notifications" onClick={() => setCounter(0)}>
          <Badge color="primary" badgeContent={counter}>
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
