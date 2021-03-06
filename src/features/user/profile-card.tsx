import React from 'react';
import {
  Badge,
  Button,
  Card,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  withStyles,
  WithStyles,
  Theme,
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import { Favorite, Inbox, ReplyAll, StarRate, SupervisedUserCircle, VoiceOverOff } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import { connect } from 'react-redux';
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import {
  amIAFollowerOf,
  countUserFollowers,
  countUserFollowings,
  createFollowing,
  removeFollowing,
} from '../../core/services/following-service';

import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser,
} from '../../core/services/topic-service';

import { ifEmptyAvatarThenPlaceholder } from '../../shared/util/user-util';
import { ChromunityUser } from '../../types';
import {
  getDistrustedUsers,
  getUserSettingsCached,
  isRegistered,
  toggleUserDistrust,
} from '../../core/services/user-service';
import { isUserSuspended, suspendUser } from '../../core/services/representatives-service';
import ChromiaPageHeader from '../../shared/chromia-page-header';
import { COLOR_ORANGE, COLOR_RED, COLOR_YELLOW } from '../../theme';
import Avatar, { AVATAR_SIZE } from '../../shared/avatar';
import { NotFound } from '../error-pages/not-found';
import ApplicationState from '../../core/application-state';
import { toLowerCase } from '../../shared/util/util';
import { clearTopicsCache } from '../walls/redux/wall-actions';
import { checkDistrustedUsers } from './redux/account-actions';
import SocialBar from './socials/social-bar';
import { Socials } from './socials/social-types';
import { notifyError } from '../../core/snackbar/redux/snackbar-actions';
import { setRateLimited, setOperationPending } from '../../shared/redux/common-actions';
import ProfileTutorial from './profile-tutorial';

const styles = (theme: Theme) =>
  createStyles({
    iconRed: {
      color: COLOR_RED,
    },
    iconYellow: {
      color: COLOR_YELLOW,
    },
    iconOrange: {
      color: COLOR_ORANGE,
    },
    contentWrapper: {
      float: 'left',
      marginTop: '10px',
      marginLeft: '10px',
      marginRight: '10px',
    },
    description: {
      marginRight: '12px',
      marginTop: '5px',
      marginLeft: '10px',
    },
    bottomBarWrapper: {
      position: 'relative',
      marginTop: '15px',
    },
    bottomBar: {
      float: 'right',
      marginBottom: '5px',
      marginTop: '5px',
      maxWidth: '60%',
      display: 'inline',
    },
    socials: {
      visibility: 'hidden',
      position: 'absolute',
      bottom: -35,
      maxWidth: '35%',
      [theme.breakpoints.up('sm')]: {
        visibility: 'visible',
      },
    },
  });

interface ProfileCardProps extends WithStyles<typeof styles> {
  username: string;
  representatives: string[];
  user: ChromunityUser;
  rateLimited: boolean;
  notifyError: typeof notifyError;
  setRateLimited: typeof setRateLimited;
  clearTopicsCache: typeof clearTopicsCache;
  checkDistrustedUsers: typeof checkDistrustedUsers;
  setOperationPending: typeof setOperationPending;
}

interface ProfileCardState {
  registered: boolean;
  following: boolean;
  followers: number;
  userFollowings: number;
  countOfTopics: number;
  countOfReplies: number;
  topicStars: number;
  replyStars: number;
  avatar: string;
  description: string;
  socials: Socials;
  suspendUserDialogOpen: boolean;
  distrusted: boolean;
  dataFetchedForUser: string;
}

const MAX_BADGE_NR = 9999999;

const ProfileCard = withStyles(styles)(
  class extends React.Component<ProfileCardProps, ProfileCardState> {
    constructor(props: ProfileCardProps) {
      super(props);

      this.state = {
        registered: true,
        following: false,
        followers: 0,
        userFollowings: 0,
        countOfTopics: 0,
        countOfReplies: 0,
        topicStars: 0,
        replyStars: 0,
        avatar: '',
        description: '',
        socials: null,
        suspendUserDialogOpen: false,
        distrusted: false,
        dataFetchedForUser: null,
      };

      this.toggleFollowing = this.toggleFollowing.bind(this);
      this.renderIcons = this.renderIcons.bind(this);
      this.renderActions = this.renderActions.bind(this);
      this.suspendUser = this.suspendUser.bind(this);
      this.handleSuspendUserClose = this.handleSuspendUserClose.bind(this);
      this.update = this.update.bind(this);
    }

    componentDidMount(): void {
      this.update();
    }

    componentDidUpdate(prevProps: Readonly<ProfileCardProps>): void {
      if (prevProps.username !== this.props.username || prevProps.user !== this.props.user) {
        this.update();
      }
    }

    update() {
      isRegistered(this.props.username).then((registered) => {
        this.setState({ registered });

        if (registered) {
          const { user } = this.props;
          if (user != null && user.name != null) {
            amIAFollowerOf(this.props.user, this.props.username).then((isAFollower) =>
              this.setState({ following: isAFollower })
            );
            getDistrustedUsers(user).then((users) =>
              this.setState({
                distrusted: users.map((u) => toLowerCase(u)).includes(toLowerCase(this.props.username)),
              })
            );
          }

          if (this.props.username !== this.state.dataFetchedForUser) {
            this.setState({ dataFetchedForUser: this.props.username });

            getUserSettingsCached(this.props.username, 1440).then((settings) =>
              this.setState({
                avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.username),
                description: settings.description,
                socials: settings.socials ? (JSON.parse(settings.socials) as Socials) : null,
              })
            );
            countUserFollowers(this.props.username).then((count) => this.setState({ followers: count }));
            countUserFollowings(this.props.username).then((count) => this.setState({ userFollowings: count }));
            countTopicsByUser(this.props.username).then((count) => this.setState({ countOfTopics: count }));
            countRepliesByUser(this.props.username).then((count) => this.setState({ countOfReplies: count }));
            countTopicStarRatingForUser(this.props.username).then((count) => this.setState({ topicStars: count }));
            countReplyStarRatingForUser(this.props.username).then((count) => this.setState({ replyStars: count }));
          }
        }
      });
    }

    toggleFollowing() {
      this.props.clearTopicsCache();
      this.props.setOperationPending(true);
      if (this.state.following) {
        removeFollowing(this.props.user, this.props.username)
          .catch((error) => {
            this.props.notifyError(error.message);
            this.props.setRateLimited();
          })
          .then(() => {
            this.setState((prevState) => ({
              following: false,
              followers: prevState.followers - 1,
              userFollowings: prevState.userFollowings,
            }));
          })
          .finally(() => this.props.setOperationPending(false));
      } else {
        createFollowing(this.props.user, this.props.username)
          .catch((error) => {
            this.props.notifyError(error.message);
            this.props.setRateLimited();
          })
          .then(() => {
            this.setState((prevState) => ({
              following: true,
              followers: prevState.followers + 1,
              userFollowings: prevState.userFollowings,
            }));
          })
          .finally(() => this.props.setOperationPending(false));
      }
    }

    suspendUser() {
      this.setState({ suspendUserDialogOpen: false });
      this.props.setOperationPending(true);
      suspendUser(this.props.user, this.props.username).finally(() => this.props.setOperationPending(false));
    }

    handleSuspendUserClose() {
      if (this.state.suspendUserDialogOpen) {
        this.setState({ suspendUserDialogOpen: false });
      }
    }

    toggleDistrustUser() {
      this.props.setOperationPending(true);
      this.setState(
        (_prevState) => ({ distrusted: !_prevState.distrusted }),
        () =>
          toggleUserDistrust(this.props.user, this.props.username, this.state.distrusted)
            .then(() => this.props.checkDistrustedUsers(this.props.user))
            .finally(() => this.props.setOperationPending(false))
      );
    }

    renderSuspensionButton() {
      if (!isUserSuspended(this.props.username)) {
        return (
          <div style={{ display: 'inline' }}>
            <IconButton
              onClick={() => this.setState({ suspendUserDialogOpen: true })}
              disabled={this.props.rateLimited}
            >
              <Tooltip title="Suspend user">
                <VoiceOverOff fontSize="large" className={this.props.classes.iconRed} />
              </Tooltip>
            </IconButton>
          </div>
        );
      }
    }

    renderRepresentativeActions() {
      if (this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name))) {
        if (!this.props.representatives.includes(toLowerCase(this.props.username))) {
          return this.renderSuspensionButton();
        }
      }
    }

    renderIcons() {
      return (
        <div className={this.props.classes.bottomBar} data-tut="bottom_stats">
          <Badge badgeContent={this.state.userFollowings} showZero color="secondary" max={MAX_BADGE_NR}>
            <Tooltip title="Following users">
              <SupervisedUserCircle style={{ marginLeft: '10px' }} />
            </Tooltip>
          </Badge>
          <Badge
            badgeContent={this.state.topicStars + this.state.replyStars}
            showZero
            color="secondary"
            max={MAX_BADGE_NR}
          >
            <Tooltip title="Stars">
              <StarRate style={{ marginLeft: '10px' }} />
            </Tooltip>
          </Badge>
          <Badge badgeContent={this.state.countOfTopics} showZero color="secondary" max={MAX_BADGE_NR}>
            <Tooltip title="Topics">
              <Inbox style={{ marginLeft: '10px' }} />
            </Tooltip>
          </Badge>
          <Badge
            badgeContent={this.state.countOfReplies}
            showZero
            max={MAX_BADGE_NR}
            color="secondary"
            style={{ marginRight: '15px' }}
          >
            <Tooltip title="Replies">
              <ReplyAll style={{ marginLeft: '10px' }} />
            </Tooltip>
          </Badge>
        </div>
      );
    }

    renderActions() {
      return (
        <div style={{ float: 'right' }} data-tut="actions_stats">
          {this.renderUserSuspensionDialog()}
          {this.renderRepresentativeActions()}
          {this.renderMuteButton()}
          {this.renderFollowButton()}
        </div>
      );
    }

    renderMuteButton() {
      if (this.props.user != null && this.props.username !== this.props.user.name) {
        return (
          <div style={{ display: 'inline' }}>
            <IconButton onClick={() => this.toggleDistrustUser()} disabled={this.props.rateLimited}>
              {this.state.distrusted ? (
                <Tooltip title="Unblock/Trust user">
                  <CheckCircleOutlineIcon fontSize="large" className={this.props.classes.iconYellow} />
                </Tooltip>
              ) : (
                <Tooltip title="Block/Distrust user">
                  <BlockIcon fontSize="large" className={this.props.classes.iconOrange} />
                </Tooltip>
              )}
            </IconButton>
          </div>
        );
      }
    }

    renderUserSuspensionDialog() {
      if (this.props.user != null && this.props.username !== this.props.user.name) {
        return (
          <Dialog
            open={this.state.suspendUserDialogOpen}
            onClose={this.handleSuspendUserClose}
            aria-labelledby="dialog-title"
          >
            <DialogTitle id="dialog-title">Are you sure?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This action will suspend the user, temporarily preventing them from posting anything.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleSuspendUserClose} color="secondary">
                No
              </Button>
              <Button onClick={this.suspendUser} color="primary" disabled={this.props.rateLimited}>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        );
      }
    }

    renderFollowButton() {
      const { user } = this.props;
      return (
        <div style={{ display: 'inline' }}>
          <IconButton
            onClick={() => this.toggleFollowing()}
            disabled={
              user == null || toLowerCase(user.name) === toLowerCase(this.props.username) || this.props.rateLimited
            }
          >
            <Badge badgeContent={this.state.followers} showZero color="secondary" max={MAX_BADGE_NR}>
              <Tooltip title={this.state.following ? 'Unfollow' : 'Follow'}>
                <Favorite fontSize="large" className={this.state.following ? this.props.classes.iconRed : ''} />
              </Tooltip>
            </Badge>
          </IconButton>
        </div>
      );
    }

    render() {
      if (this.state.registered) {
        return (
          <div>
            <ChromiaPageHeader text={`@${this.props.username}`} />
            <Card key="user-card">
              {this.renderActions()}
              <div className={this.props.classes.contentWrapper}>
                <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE} name={this.props.username} />
              </div>
              <Typography variant="subtitle1" component="p" className={this.props.classes.description}>
                {this.state.description !== '' ? this.state.description : "I haven't written any description yet..."}
              </Typography>
              <div style={{ clear: 'left' }} />
              <div className={this.props.classes.bottomBarWrapper}>
                {this.state.socials && (
                  <div className={this.props.classes.socials}>
                    <SocialBar socials={this.state.socials} />
                  </div>
                )}
                {this.renderIcons()}
              </div>
            </Card>
            <ProfileTutorial />
          </div>
        );
      }
      return <NotFound />;
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    rateLimited: store.common.rateLimited,
  };
};

const mapDispatchToProps = {
  clearTopicsCache,
  checkDistrustedUsers,
  notifyError,
  setRateLimited,
  setOperationPending,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileCard);
