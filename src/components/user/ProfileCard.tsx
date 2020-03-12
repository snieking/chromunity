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
  WithStyles
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import {
  Favorite,
  Inbox,
  ReplyAll,
  StarRate,
  SupervisedUserCircle,
  VoiceOverOff,
  SentimentVeryDissatisfiedSharp
} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {
  amIAFollowerOf,
  countUserFollowers,
  countUserFollowings,
  createFollowing,
  removeFollowing
} from "../../blockchain/FollowingService";

import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser
} from "../../blockchain/TopicService";

import { ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import { ChromunityUser } from "../../types";
import {
  getDistrustedUsers,
  getUserSettingsCached,
  isRegistered,
  toggleUserDistrust
} from "../../blockchain/UserService";
import { isUserSuspended, suspendUser } from "../../blockchain/RepresentativesService";
import ChromiaPageHeader from "../common/ChromiaPageHeader";
import { COLOR_ORANGE, COLOR_RED, COLOR_YELLOW } from "../../theme";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import { NotFound } from "../static/NotFound";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import { toLowerCase } from "../../util/util";
import { clearTopicsCache } from "../walls/redux/wallActions";
import Tutorial from "../common/Tutorial";
import TutorialButton from "../buttons/TutorialButton";
import { step } from "../common/TutorialStep";
import { checkDistrustedUsers } from "./redux/accountActions";
import BlockIcon from "@material-ui/icons/Block";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";

const styles = createStyles({
  iconRed: {
    color: COLOR_RED
  },
  iconYellow: {
    color: COLOR_YELLOW
  },
  iconOrange: {
    color: COLOR_ORANGE
  },
  contentWrapper: {
    float: "left",
    marginTop: "10px",
    marginLeft: "10px",
    marginRight: "10px"
  },
  description: {
    marginRight: "12px",
    marginTop: "5px",
    marginLeft: "10px"
  },
  bottomBar: {
    float: "right",
    marginBottom: "5px",
    marginTop: "5px"
  }
});

interface ProfileCardProps extends WithStyles<typeof styles> {
  username: string;
  representatives: string[];
  user: ChromunityUser;
  clearTopicsCache: typeof clearTopicsCache;
  checkDistrustedUsers: typeof checkDistrustedUsers;
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
  suspendUserDialogOpen: boolean;
  distrustDialogOpen: boolean;
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
        suspendUserDialogOpen: false,
        distrustDialogOpen: false,
        distrusted: false
      };

      this.toggleFollowing = this.toggleFollowing.bind(this);
      this.renderIcons = this.renderIcons.bind(this);
      this.renderActions = this.renderActions.bind(this);
      this.suspendUser = this.suspendUser.bind(this);
      this.handleSuspendUserClose = this.handleSuspendUserClose.bind(this);
      this.handleDistrustDialogClose = this.handleDistrustDialogClose.bind(this);
    }

    componentDidMount(): void {
      isRegistered(this.props.username).then(isRegistered => {
        this.setState({ registered: isRegistered });

        if (isRegistered) {
          const user: ChromunityUser = this.props.user;
          if (user != null && user.name != null) {
            amIAFollowerOf(this.props.user, this.props.username).then(isAFollower =>
              this.setState({ following: isAFollower })
            );
            getDistrustedUsers(user).then(users =>
              this.setState({
                distrusted: users.includes(this.props.username.toLocaleLowerCase())
              })
            );
          }

          getUserSettingsCached(this.props.username, 1440).then(settings =>
            this.setState({
              avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, this.props.username),
              description: settings.description
            })
          );
          countUserFollowers(this.props.username).then(count => this.setState({ followers: count }));
          countUserFollowings(this.props.username).then(count => this.setState({ userFollowings: count }));
          countTopicsByUser(this.props.username).then(count => this.setState({ countOfTopics: count }));
          countRepliesByUser(this.props.username).then(count => this.setState({ countOfReplies: count }));
          countTopicStarRatingForUser(this.props.username).then(count => this.setState({ topicStars: count }));
          countReplyStarRatingForUser(this.props.username).then(count => this.setState({ replyStars: count }));
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
              {this.renderIcons()}
            </Card>
            {this.renderTour()}
          </div>
        );
      } else {
        return <NotFound />;
      }
    }

    toggleFollowing() {
      this.props.clearTopicsCache();
      if (this.state.following) {
        removeFollowing(this.props.user, this.props.username).then(() => {
          this.setState(prevState => ({
            following: false,
            followers: prevState.followers - 1,
            userFollowings: prevState.userFollowings
          }));
        });
      } else {
        createFollowing(this.props.user, this.props.username).then(() => {
          this.setState(prevState => ({
            following: true,
            followers: prevState.followers + 1,
            userFollowings: prevState.userFollowings
          }));
        });
      }
    }

    renderRepresentativeActions() {
      if (this.props.user != null && this.props.representatives.includes(toLowerCase(this.props.user.name))) {
        if (this.props.representatives.includes(toLowerCase(this.props.username))) {
          return toLowerCase(this.props.username) !== toLowerCase(this.props.user.name)
            ? this.renderDistrustButton()
            : null;
        } else {
          return this.renderSuspensionButton();
        }
      }
    }

    renderDistrustButton() {
      return (
        <div style={{ display: "inline" }}>
          <IconButton onClick={() => this.setState({ distrustDialogOpen: true })}>
            <Tooltip title="Distrust the representative">
              <SentimentVeryDissatisfiedSharp fontSize="large" className={this.props.classes.iconRed} />
            </Tooltip>
          </IconButton>
        </div>
      );
    }

    renderSuspensionButton() {
      if (!isUserSuspended(this.props.username)) {
        return (
          <div style={{ display: "inline" }}>
            <IconButton onClick={() => this.setState({ suspendUserDialogOpen: true })}>
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
      suspendUser(this.props.user, this.props.username);
    }

    handleSuspendUserClose() {
      if (this.state.suspendUserDialogOpen) {
        this.setState({ suspendUserDialogOpen: false });
      }
    }

    handleDistrustDialogClose() {
      if (this.state.distrustDialogOpen) {
        this.setState({ distrustDialogOpen: false });
      }
    }

    toggleDistrustUser() {
      const distrusted: boolean = !this.state.distrusted;
      this.setState({ distrusted: distrusted }, () =>
        toggleUserDistrust(this.props.user, this.props.username, distrusted).then(() =>
          this.props.checkDistrustedUsers(this.props.user)
        )
      );
    }

    renderIcons() {
      return (
        <div className={this.props.classes.bottomBar} data-tut="bottom_stats">
          <Badge badgeContent={this.state.followers} showZero={true} color="secondary" max={MAX_BADGE_NR}>
            <Tooltip title="Followers">
              <Favorite />
            </Tooltip>
          </Badge>

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
            <IconButton onClick={() => this.toggleDistrustUser()}>
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
              <Button onClick={this.suspendUser} color="primary">
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        );
      }
    }

    renderFollowButton() {
      const user: ChromunityUser = this.props.user;
      if (user == null || toLowerCase(user.name) === toLowerCase(this.props.username)) {
        return (
          <div style={{ display: "inline" }}>
            <Badge
              badgeContent={this.state.followers}
              showZero={true}
              color="secondary"
              max={MAX_BADGE_NR}
              style={{ marginRight: "12px", marginTop: "12px" }}
            >
              <Tooltip title="Followers">
                <Favorite fontSize="large" />
              </Tooltip>
            </Badge>
          </div>
        );
      } else {
        return (
          <div style={{ display: "inline" }}>
            <IconButton onClick={() => this.toggleFollowing()}>
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

    renderTour() {
      return (
        <>
          <Tutorial steps={this.steps()} />
          <TutorialButton />
        </>
      );
    }

    steps() {
      return [
        step(".first-step", <p>This is a user page. Here you get an overview of the user and it's recent activity.</p>),
        step(
          '[data-tut="actions_stats"]',
          <p>
            How many followers the user has is displayed here. If you are logged in, clickable actions is also shown
            here.
          </p>
        ),
        step('[data-tut="bottom_stats"]', <p>More statistics of the user is displayed here.</p>),
        step('[data-tut="topics_nav"]', <p>Recent topics created by the user is listed here.</p>),
        step('[data-tut="replies_nav"]', <p>Recent replies on topics made by the user is listed here.</p>),
        step('[data-tut="channels_nav"]', <p>Channels that the user is following is listed here.</p>)
      ];
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map(rep => toLowerCase(rep))
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    clearTopicsCache: () => dispatch(clearTopicsCache()),
    checkDistrustedUsers: (user: ChromunityUser) => dispatch(checkDistrustedUsers(user))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileCard);
