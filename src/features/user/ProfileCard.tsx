import React from "react";
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
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import { Favorite, Inbox, ReplyAll, StarRate, SupervisedUserCircle, VoiceOverOff } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {
  amIAFollowerOf,
  countUserFollowers,
  countUserFollowings,
  createFollowing,
  removeFollowing,
} from "../../core/services/FollowingService";

import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser,
} from "../../core/services/TopicService";

import { ifEmptyAvatarThenPlaceholder } from "../../shared/util/user-util";
import { ChromunityUser } from "../../types";
import {
  getDistrustedUsers,
  getUserSettingsCached,
  isRegistered,
  toggleUserDistrust,
} from "../../core/services/UserService";
import { isUserSuspended, suspendUser } from "../../core/services/RepresentativesService";
import ChromiaPageHeader from "../../shared/ChromiaPageHeader";
import { COLOR_ORANGE, COLOR_RED, COLOR_YELLOW } from "../../theme";
import Avatar, { AVATAR_SIZE } from "../../shared/Avatar";
import { NotFound } from "../error-pages/NotFound";
import { ApplicationState } from "../../core/store";
import { connect } from "react-redux";
import { toLowerCase } from "../../shared/util/util";
import { clearTopicsCache } from "../walls/redux/wallActions";
import { checkDistrustedUsers } from "./redux/accountActions";
import BlockIcon from "@material-ui/icons/Block";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import SocialBar from "./socials/SocialBar";
import { Socials } from "./socials/socialTypes";
import { setError } from "../../core/snackbar/redux/snackbarTypes";
import { setRateLimited, setOperationPending } from "../../shared/redux/CommonActions";
import ProfileTutorial from "./ProfileTutorial";

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
      float: "left",
      marginTop: "10px",
      marginLeft: "10px",
      marginRight: "10px",
    },
    description: {
      marginRight: "12px",
      marginTop: "5px",
      marginLeft: "10px",
    },
    bottomBarWrapper: {
      position: "relative",
      marginTop: "15px",
    },
    bottomBar: {
      float: "right",
      marginBottom: "5px",
      marginTop: "5px",
      maxWidth: "60%",
      display: "inline",
    },
    socials: {
      visibility: "hidden",
      position: "absolute",
      bottom: -35,
      maxWidth: "35%",
      [theme.breakpoints.up("sm")]: {
        visibility: "visible",
      },
    },
  });

interface ProfileCardProps extends WithStyles<typeof styles> {
  username: string;
  representatives: string[];
  user: ChromunityUser;
  rateLimited: boolean;
  setError: typeof setError;
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
        avatar: "",
        description: "",
        socials: null,
        suspendUserDialogOpen: false,
        distrusted: false,
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
      if (prevProps.username !== this.props.username) {
        this.update();
      }
    }

    update() {
      isRegistered(this.props.username).then((isRegistered) => {
        this.setState({ registered: isRegistered });

        if (isRegistered) {
          const user: ChromunityUser = this.props.user;
          if (user != null && user.name != null) {
            amIAFollowerOf(this.props.user, this.props.username).then((isAFollower) =>
              this.setState({ following: isAFollower })
            );
            getDistrustedUsers(user).then((users) =>
              this.setState({
                distrusted: users.map((user) => toLowerCase(user)).includes(toLowerCase(this.props.username)),
              })
            );
          }

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
      });
    }

    render() {
      if (this.state.registered) {
        return (
          <div>
            <ChromiaPageHeader text={"@" + this.props.username} />
            <Card key={"user-card"}>
              {this.renderActions()}
              <div className={this.props.classes.contentWrapper}>
                <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE} name={this.props.username} />
              </div>
              <Typography variant="subtitle1" component="p" className={this.props.classes.description}>
                {this.state.description !== "" ? this.state.description : "I haven't written any description yet..."}
              </Typography>
              <div style={{ clear: "left" }} />
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
      } else {
        return <NotFound />;
      }
    }

    toggleFollowing() {
      this.props.clearTopicsCache();
      this.props.setOperationPending(true);
      if (this.state.following) {
        removeFollowing(this.props.user, this.props.username)
          .catch((error) => {
            this.props.setError(error.message);
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
            this.props.setError(error.message);
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

    renderRepresentativeActions() {
      if (this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name))) {
        if (!this.props.representatives.includes(toLowerCase(this.props.username))) {
          return this.renderSuspensionButton();
        }
      }
    }

    renderSuspensionButton() {
      if (!isUserSuspended(this.props.username)) {
        return (
          <div style={{ display: "inline" }}>
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
      const distrusted: boolean = !this.state.distrusted;
      this.setState({ distrusted: distrusted }, () =>
        toggleUserDistrust(this.props.user, this.props.username, distrusted)
          .then(() => this.props.checkDistrustedUsers(this.props.user))
          .finally(() => this.props.setOperationPending(false))
      );
    }

    renderIcons() {
      return (
        <div className={this.props.classes.bottomBar} data-tut="bottom_stats">
          <Badge badgeContent={this.state.userFollowings} showZero={true} color="secondary" max={MAX_BADGE_NR}>
            <Tooltip title="Following users">
              <SupervisedUserCircle style={{ marginLeft: "10px" }} />
            </Tooltip>
          </Badge>
          <Badge
            badgeContent={this.state.topicStars + this.state.replyStars}
            showZero={true}
            color="secondary"
            max={MAX_BADGE_NR}
          >
            <Tooltip title="Stars">
              <StarRate style={{ marginLeft: "10px" }} />
            </Tooltip>
          </Badge>
          <Badge badgeContent={this.state.countOfTopics} showZero={true} color="secondary" max={MAX_BADGE_NR}>
            <Tooltip title="Topics">
              <Inbox style={{ marginLeft: "10px" }} />
            </Tooltip>
          </Badge>
          <Badge
            badgeContent={this.state.countOfReplies}
            showZero={true}
            max={MAX_BADGE_NR}
            color="secondary"
            style={{ marginRight: "15px" }}
          >
            <Tooltip title="Replies">
              <ReplyAll style={{ marginLeft: "10px" }} />
            </Tooltip>
          </Badge>
        </div>
      );
    }

    renderActions() {
      return (
        <div style={{ float: "right" }} data-tut="actions_stats">
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
          <div style={{ display: "inline" }}>
            <IconButton onClick={() => this.toggleDistrustUser()} disabled={this.props.rateLimited}>
              {this.state.distrusted ? (
                <Tooltip title={"Unblock/Trust user"}>
                  <CheckCircleOutlineIcon fontSize={"large"} className={this.props.classes.iconYellow} />
                </Tooltip>
              ) : (
                <Tooltip title="Block/Distrust user">
                  <BlockIcon fontSize={"large"} className={this.props.classes.iconOrange} />
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
      const user: ChromunityUser = this.props.user;
      return (
        <div style={{ display: "inline" }}>
          <IconButton
            onClick={() => this.toggleFollowing()}
            disabled={
              user == null || toLowerCase(user.name) === toLowerCase(this.props.username) || this.props.rateLimited
            }
          >
            <Badge badgeContent={this.state.followers} showZero={true} color="secondary" max={MAX_BADGE_NR}>
              <Tooltip title={this.state.following ? "Unfollow" : "Follow"}>
                <Favorite fontSize="large" className={this.state.following ? this.props.classes.iconRed : ""} />
              </Tooltip>
            </Badge>
          </IconButton>
        </div>
      );
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

const mapDispatchToProps = (dispatch: any) => {
  return {
    clearTopicsCache: () => dispatch(clearTopicsCache()),
    checkDistrustedUsers: (user: ChromunityUser) => dispatch(checkDistrustedUsers(user)),
    setError: (msg: string) => dispatch(setError(msg)),
    setRateLimited: () => dispatch(setRateLimited()),
    setOperationPending: (pending: boolean) => dispatch(setOperationPending(pending)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileCard);
