import React, { useEffect, useState } from "react";
import { Container, LinearProgress } from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import { getUserNotificationsPriorToTimestamp, markNotificationsRead } from "../../../blockchain/NotificationService";
import { UserNotification } from "../../../types";
import NotificationCard from "./NotificationCard";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import LoadMoreButton from "../../buttons/LoadMoreButton";
import { getUser } from "../../../util/user-util";

interface MatchParams {
  userId: string;
}

interface UserNotificationsProps extends RouteComponentProps<MatchParams> {}

const notificationsPageSize: number = 25;

const UserNotifications: React.FunctionComponent<UserNotificationsProps> = props => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [couldExistOlderNotifications, setCouldExistOlderNotifications] = useState<boolean>(false);

  const user = getUser();

  useEffect(() => {
    retrieveNotifications();
    // eslint-disable-next-line
  }, []);

  function retrieveNotifications() {
    const userId = props.match.params.userId;

    setLoading(true);
    const timestamp: number =
      notifications.length !== 0 ? notifications[notifications.length - 1].timestamp : Date.now();

    getUserNotificationsPriorToTimestamp(userId, timestamp, notificationsPageSize)
      .then(retrievedNotifications => {
        setLoading(false);

        if (
          retrievedNotifications.length > 0 &&
          (notifications.length < 1 || retrievedNotifications[0].id !== notifications[0].id)
        ) {
          setNotifications(Array.from(new Set(notifications.concat(retrievedNotifications))));
          setCouldExistOlderNotifications(retrievedNotifications.length >= notificationsPageSize);

          if (user != null && user.name === userId) {
            markNotificationsRead(user).then();
          }
        }
      })
      .catch(() => setLoading(false));
  }

  function renderLoadMoreButton() {
    if (couldExistOlderNotifications) {
      return <LoadMoreButton onClick={retrieveNotifications} />;
    }
  }

  return (
    <Container fixed maxWidth="md">
      <ChromiaPageHeader text="User Notifications" />
      {isLoading ? <LinearProgress variant="query" /> : <div />}
      {notifications.map(notification => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
      {renderLoadMoreButton()}
    </Container>
  );

};

export default UserNotifications;
