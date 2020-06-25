import React, { useState, useEffect } from 'react';
import { ListItemIcon, Typography, MenuItem } from '@material-ui/core';
import { Notifications, NotificationsActive } from '@material-ui/icons';
import { connect } from 'react-redux';
import { ChromunityUser } from '../../../types';
import { getTopicSubscribers, unsubscribeFromTopic, subscribeToTopic } from '../../../core/services/topic-service';
import { toLowerCase } from '../../../shared/util/util';
import ApplicationState from '../../../core/application-state';
import { setOperationPending, setRateLimited } from '../../../shared/redux/common-actions';
import { notifyError, notifyInfo } from '../../../core/snackbar/redux/snackbar-actions';

interface Props {
  topicId: string;
  user: ChromunityUser;
  rateLimited: boolean;
  setOperationPending: typeof setOperationPending;
  setRateLimited: typeof setRateLimited;
  notifyError: typeof notifyError;
  notifyInfo: typeof notifyInfo;
  onConfirm: () => void;
}

const SubscribeButton: React.FunctionComponent<Props> = (props) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.topicId && props.user) {
      getTopicSubscribers(props.topicId).then((subscribers) =>
        setSubscribed(subscribers.map((n) => toLowerCase(n)).includes(toLowerCase(props.user.name)))
      );
    }
  }, [props.topicId, props.user]);

  const toggleSubscription = () => {
    if (!loading) {
      setLoading(true);
      props.setOperationPending(true);
      props.onConfirm();

      const { topicId, user } = props;

      if (subscribed) {
        unsubscribeFromTopic(user, topicId)
          .then(() => setSubscribed(false))
          .catch((error) => {
            props.notifyError(error.message);
            props.setRateLimited();
          })
          .finally(() => {
            setLoading(false);
            props.setOperationPending(false);
          });
      } else {
        subscribeToTopic(user, topicId)
          .then(() => setSubscribed(true))
          .catch((error) => {
            props.notifyError(error.message);
            props.setRateLimited();
          })
          .finally(() => {
            setLoading(false);
            props.setOperationPending(false);
          });
      }
    }
  };

  const unsubscribeButton = () => {
    return (
      <MenuItem onClick={toggleSubscription} disabled={loading || props.rateLimited}>
        <ListItemIcon>
          <Notifications />
        </ListItemIcon>
        <Typography>Unsubscribe</Typography>
      </MenuItem>
    );
  };

  const subscribeButton = () => {
    return (
      <MenuItem onClick={toggleSubscription} disabled={loading || props.rateLimited}>
        <ListItemIcon>
          <NotificationsActive />
        </ListItemIcon>
        <Typography>Subscribe</Typography>
      </MenuItem>
    );
  };

  if (!props.user) {
    return null;
  }

  return subscribed ? unsubscribeButton() : subscribeButton();
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    rateLimited: store.common.rateLimited,
  };
};

const mapDispatchToProps = {
  notifyError,
  notifyInfo,
  setRateLimited,
  setOperationPending,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubscribeButton);
