import React, { useState, useEffect } from "react";
import { ChromunityUser } from "../../../types";
import { setError } from "../../../core/snackbar/redux/snackbarTypes";
import { setRateLimited, setOperationPending } from "../../../shared/redux/CommonActions";
import { connect } from "react-redux";
import { ApplicationState } from "../../../core/store";
import {
  unfollowChannel,
  followChannel,
  getFollowedChannels,
  countChannelFollowers,
} from "../../../core/services/ChannelService";
import { clearTopicsCache } from "../redux/wallActions";
import { IconButton, Badge, Tooltip } from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";
import { toLowerCase } from "../../../shared/util/util";

interface Props {
  channel: string;
  rateLimited: boolean;
  user: ChromunityUser;
  setError: typeof setError;
  setRateLimited: typeof setRateLimited;
  clearTopicsCache: typeof clearTopicsCache;
  setOperationPending: typeof setOperationPending;
}

const ChannelFollowingButton: React.FunctionComponent<Props> = (props) => {
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [nrOfFollowers, setNrOfFollowers] = useState(0);

  useEffect(() => {
    if (props.user && props.channel) {
      getFollowedChannels(props.user.name).then((channels) =>
        setFollowed(channels.includes(toLowerCase(props.channel)))
      );
    }
  }, [props.user, props.channel]);

  useEffect(() => {
    if (props.channel && nrOfFollowers === 0) {
      countChannelFollowers(props.channel).then((count) => setNrOfFollowers(count));
    }
  }, [props.channel, nrOfFollowers]);

  function toggleChannelFollow() {
    if (!loading) {
      props.clearTopicsCache();
      setLoading(true);
      props.setOperationPending(true);
      if (followed) {
        unfollowChannel(props.user, props.channel)
          .catch((error: Error) => {
            props.setError(error.message);
            props.setRateLimited();
          })
          .then(() => {
            setFollowed(false);
            setNrOfFollowers(nrOfFollowers - 1);
          })
          .finally(() => {
            setLoading(false);
            props.setOperationPending(false);
          });
      } else {
        followChannel(props.user, props.channel)
          .then(() => {
            setFollowed(true);
            setNrOfFollowers(nrOfFollowers + 1);
          })
          .catch((error: Error) => {
            props.setError(error.message);
            props.setRateLimited();
          })
          .finally(() => {
            setLoading(false);
            props.setOperationPending(false);
          });
      }
    }
  }

  return (
    <IconButton onClick={() => toggleChannelFollow()} disabled={props.user == null || props.rateLimited}>
      <Badge badgeContent={nrOfFollowers} color="primary">
        <Tooltip title={followed ? "Unfollow channel" : "Follow channel"}>
          {followed ? (
            <Favorite className="red-color" fontSize="large" />
          ) : (
            <FavoriteBorder className="pink-color" fontSize="large" />
          )}
        </Tooltip>
      </Badge>
    </IconButton>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    setRateLimited: () => dispatch(setRateLimited()),
    clearTopicsCache: () => dispatch(clearTopicsCache()),
    setOperationPending: (pending: boolean) => dispatch(setOperationPending(pending))
  };
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    rateLimited: store.common.rateLimited,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChannelFollowingButton);
