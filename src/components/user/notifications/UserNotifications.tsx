import React, { useEffect, useState } from "react";
import { Container, LinearProgress } from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import { getUserNotificationsPriorToTimestamp, markNotificationsRead } from "../../../blockchain/NotificationService";
import { ChromunityUser, UserNotification } from "../../../types";
import NotificationCard from "./NotificationCard";
import ChromiaPageHeader from "../../common/ChromiaPageHeader";
import LoadMoreButton from "../../buttons/LoadMoreButton";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";

interface MatchParams {
  userId: string;
}

interface UserNotificationsProps extends RouteComponentProps<MatchParams> {
  user: ChromunityUser;
}

const notificationsPageSize: number = 25;

const UserNotifications: React.FunctionComponent<UserNotificationsProps> = props => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [couldExistOlderNotifications, setCouldExistOlderNotifications] = useState<boolean>(false);

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

          if (props.user != null && props.user.name === userId) {
            markNotificationsRead(props.user).then();
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

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(UserNotifications);
