import React, { useEffect, useState } from "react";
import { Container } from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import {
  getUserNotificationsPriorToTimestamp,
  markNotificationsRead,
} from "../../../core/services/NotificationService";
import { ChromunityUser, UserNotification } from "../../../types";
import NotificationCard from "./NotificationCard";
import ChromiaPageHeader from "../../../shared/ChromiaPageHeader";
import LoadMoreButton from "../../../shared/buttons/LoadMoreButton";
import { ApplicationState } from "../../../core/store";
import { connect } from "react-redux";
import { setQueryPending } from "../../../shared/redux/CommonActions";

interface MatchParams {
  userId: string;
}

interface UserNotificationsProps extends RouteComponentProps<MatchParams> {
  user: ChromunityUser;
  setQueryPending: typeof setQueryPending;
}

const notificationsPageSize: number = 25;

const UserNotifications: React.FunctionComponent<UserNotificationsProps> = (props) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [couldExistOlderNotifications, setCouldExistOlderNotifications] = useState<boolean>(false);

  useEffect(() => {
    retrieveNotifications();
    // eslint-disable-next-line
  }, []);

  function retrieveNotifications() {
    const userId = props.match.params.userId;

    props.setQueryPending(true);
    const timestamp: number =
      notifications.length !== 0 ? notifications[notifications.length - 1].timestamp : Date.now();

    getUserNotificationsPriorToTimestamp(userId, timestamp, notificationsPageSize)
      .then((retrievedNotifications) => {
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
      .finally(() => props.setQueryPending(false));
  }

  function renderLoadMoreButton() {
    if (couldExistOlderNotifications) {
      return <LoadMoreButton onClick={retrieveNotifications} />;
    }
  }

  return (
    <Container fixed maxWidth="md">
      <ChromiaPageHeader text="User Notifications" />
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
      {renderLoadMoreButton()}
    </Container>
  );
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setQueryPending: (pending: boolean) => dispatch(setQueryPending(pending)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserNotifications);
