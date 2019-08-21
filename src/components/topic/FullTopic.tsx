import React from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import ReplyTopicButton from "../buttons/ReplyTopicButton";
import EditMessageButton from "../buttons/EditMessageButton";
import {
  getTopicById,
  getTopicRepliesAfterTimestamp,
  getTopicRepliesPriorToTimestamp,
  getTopicStarRaters,
  getTopicSubscribers,
  giveTopicStarRating,
  modifyTopic,
  removeTopic,
  removeTopicStarRating,
  subscribeToTopic,
  unsubscribeFromTopic
} from "../../blockchain/TopicService";
import { Topic, TopicReply, ChromunityUser } from "../../types";
import { getUser, ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import {
  Delete,
  Notifications,
  NotificationsActive,
  Report,
  StarBorder,
  StarRate,
  SubdirectoryArrowRight
} from "@material-ui/icons";
import { getMutedUsers, getUserSettingsCached } from "../../blockchain/UserService";
import TopicReplyCard from "./TopicReplyCard";
import LoadMoreButton from "../buttons/LoadMoreButton";
import { getRepresentatives, reportTopic } from "../../blockchain/RepresentativesService";
import Timestamp from "../common/Timestamp";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import { COLOR_ORANGE, COLOR_PURPLE, COLOR_RED, COLOR_YELLOW } from "../../theme";
import MarkdownRenderer from "../common/MarkdownRenderer";

const styles = createStyles({
  authorName: {
    display: "block",
    paddingTop: "2px",
    paddingLeft: "5px",
    paddingRight: "5px"
  },
  authorLink: {
    float: "right",
    borderRadius: "0 0 0 5px",
    marginTop: "-18px",
    marginBottom: "7px",
    marginRight: "-16px"
  },
  iconYellow: {
    color: COLOR_YELLOW
  },
  iconOrange: {
    color: COLOR_ORANGE
  },
  iconRed: {
    color: COLOR_RED
  }
});

interface MatchParams {
  id: string;
}

export interface FullTopicProps extends RouteComponentProps<MatchParams>, WithStyles<typeof styles> {
  pathName: string;
}

export interface FullTopicState {
  topic: Topic;
  representatives: string[];
  avatar: string;
  stars: number;
  ratedByMe: boolean;
  subscribed: boolean;
  topicReplies: TopicReply[];
  replyBoxOpen: boolean;
  replyMessage: string;
  couldExistOlderReplies: boolean;
  isLoading: boolean;
  removeTopicDialogOpen: boolean;
  mutedUsers: string[];
  user: ChromunityUser;
}

const repliesPageSize: number = 25;
const allowedEditTimeMillis: number = 300000;

const FullTopic = withStyles(styles)(
  class extends React.Component<FullTopicProps, FullTopicState> {
    constructor(props: FullTopicProps) {
      super(props);

      const initialTopic: Topic = {
        id: "",
        title: "",
        author: "",
        message: "",
        timestamp: 0,
        last_modified: 0,
        removed: true
      };

      this.state = {
        topic: initialTopic,
        representatives: [],
        avatar: "",
        ratedByMe: false,
        subscribed: false,
        stars: 0,
        topicReplies: [],
        replyBoxOpen: false,
        replyMessage: "",
        couldExistOlderReplies: false,
        isLoading: true,
        removeTopicDialogOpen: false,
        mutedUsers: [],
        user: getUser()
      };

      this.retrieveLatestReplies = this.retrieveLatestReplies.bind(this);
      this.handleReplySubmit = this.handleReplySubmit.bind(this);
      this.retrieveOlderReplies = this.retrieveOlderReplies.bind(this);
      this.editTopicMessage = this.editTopicMessage.bind(this);
    }

    componentDidMount(): void {
      const id = this.props.match.params.id;
      const user: ChromunityUser = this.state.user;

      if (user != null) {
        getMutedUsers(user).then(users => this.setState({ mutedUsers: users }));
      }

      getTopicById(id).then(topic => this.consumeTopicData(topic));
      this.retrieveLatestReplies();
      getTopicStarRaters(id).then(usersWhoStarRated =>
        this.setState({
          stars: usersWhoStarRated.length,
          ratedByMe: usersWhoStarRated.includes(user != null && user.name)
        })
      );
      getRepresentatives().then(representatives => this.setState({ representatives: representatives }));
      getTopicSubscribers(id).then(subscribers =>
        this.setState({
          subscribed: user != null && subscribers.includes(user.name)
        })
      );
    }

    consumeTopicData(topic: Topic): void {
      this.setState({ topic: topic });
      getUserSettingsCached(topic.author, 86400).then(settings =>
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, topic.author)
        })
      );
    }

    retrieveLatestReplies(): void {
      const topicId: string = this.props.match.params.id;
      this.setState({ isLoading: true });
      let replies: Promise<TopicReply[]>;
      if (this.state.topicReplies.length === 0) {
        replies = getTopicRepliesPriorToTimestamp(topicId, Date.now(), repliesPageSize);
      } else {
        replies = getTopicRepliesAfterTimestamp(topicId, this.state.topicReplies[0].timestamp, repliesPageSize);
      }

      replies
        .then(retrievedReplies => {
          if (retrievedReplies.length > 0) {
            this.setState(prevState => ({
              topicReplies: Array.from(new Set(retrievedReplies.concat(prevState.topicReplies))),
              isLoading: false,
              couldExistOlderReplies: retrievedReplies.length >= repliesPageSize
            }));
          } else {
            this.setState({ isLoading: false });
          }
        })
        .catch(() => this.setState({ isLoading: false }));
    }

    retrieveOlderReplies() {
      if (this.state.topicReplies.length > 0) {
        this.setState({ isLoading: true });
        const oldestTimestamp: number = this.state.topicReplies[this.state.topicReplies.length - 1].timestamp;
        getTopicRepliesPriorToTimestamp(this.state.topic.id, oldestTimestamp - 1, repliesPageSize).then(
          retrievedReplies => {
            retrievedReplies.forEach(reply => console.log("Reply timestamp is: ", reply.timestamp));
            if (retrievedReplies.length > 0) {
              this.setState(prevState => ({
                topicReplies: Array.from(new Set(prevState.topicReplies.concat(retrievedReplies))),
                isLoading: false,
                couldExistOlderReplies: retrievedReplies.length >= repliesPageSize
              }));
            } else {
              this.setState({ isLoading: false, couldExistOlderReplies: false });
            }
          }
        );
      }
    }

    toggleStarRate() {
      if (!this.state.isLoading) {
        this.setState({ isLoading: true });
        const id: string = this.state.topic.id;
        const user: ChromunityUser = this.state.user;

        if (user != null) {
          if (this.state.ratedByMe) {
            removeTopicStarRating(user, id)
              .then(() =>
                this.setState(prevState => ({
                  ratedByMe: false,
                  stars: prevState.stars - 1,
                  isLoading: false
                }))
              )
              .catch(() => this.setState({ isLoading: false }));
          } else {
            giveTopicStarRating(user, id)
              .then(() =>
                this.setState(prevState => ({
                  ratedByMe: true,
                  stars: prevState.stars + 1,
                  isLoading: false
                }))
              )
              .catch(() => this.setState({ isLoading: false }));
          }
        } else {
          window.location.replace("/user/account");
        }
      }
    }

    toggleSubscription() {
      if (!this.state.isLoading) {
        this.setState({ isLoading: true });
        const id: string = this.state.topic.id;
        const user: ChromunityUser = this.state.user;

        if (user != null) {
          if (this.state.subscribed) {
            unsubscribeFromTopic(user, id)
              .then(() => this.setState({ subscribed: false, isLoading: false }))
              .catch(() => this.setState({ isLoading: false }));
          } else {
            subscribeToTopic(user, id)
              .then(() => this.setState({ subscribed: true, isLoading: false }))
              .catch(() => this.setState({ isLoading: false }));
          }
        } else {
          window.location.replace("/user/account");
        }
      }
    }

    renderAuthor() {
      return (
        <div style={{ float: "right" }}>
          <Link
            className={this.props.classes.authorLink}
            to={"/u/" + this.state.topic.author}
            style={{
              backgroundColor: this.state.representatives.includes(this.state.topic.author)
                ? COLOR_ORANGE
                : COLOR_PURPLE
            }}
          >
            <Typography gutterBottom variant="subtitle1" component="span" className="typography">
              <span className={this.props.classes.authorName}>@{this.state.topic.author}</span>
            </Typography>
          </Link>
          <br />
          <div style={{ float: "right" }}>
            <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE} />
          </div>
        </div>
      );
    }

    renderCardContent(content: string) {
      return (
        <CardContent>
          {this.renderAuthor()}
          <Timestamp milliseconds={this.state.topic.timestamp} />
          <Typography gutterBottom variant="h6" component="h6">
            {this.state.topic.title}
          </Typography>
          <MarkdownRenderer text={content} />
        </CardContent>
      );
    }

    renderCardActions() {
      const user: ChromunityUser = this.state.user;
      return (
        <CardActions style={{ marginTop: "-20px" }}>
          <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
            <Badge color="primary" badgeContent={this.state.stars}>
              <Tooltip title="Like">
                {this.state.ratedByMe ? <StarRate className={this.props.classes.iconYellow} /> : <StarBorder />}
              </Tooltip>
            </Badge>
          </IconButton>
          <IconButton aria-label="Subscribe" onClick={() => this.toggleSubscription()}>
            {this.state.subscribed ? (
              <Tooltip title="Unsubscribe">
                <NotificationsActive className={this.props.classes.iconOrange} />
              </Tooltip>
            ) : (
              <Tooltip title="Subscribe">
                <Notifications />
              </Tooltip>
            )}
          </IconButton>

          {this.state.topic.timestamp + allowedEditTimeMillis > Date.now() &&
          user != null &&
          this.state.topic.author === user.name ? (
            <EditMessageButton value={this.state.topic.message} submitFunction={this.editTopicMessage} />
          ) : (
            <div />
          )}

          <IconButton aria-label="Report" onClick={() => this.reportTopic()}>
            <Tooltip title="Report">
              <Report />
            </Tooltip>
          </IconButton>

          {this.renderAdminActions()}
        </CardActions>
      );
    }

    editTopicMessage(text: string) {
      this.setState({ isLoading: true });
      modifyTopic(this.state.user, this.state.topic.id, text).then(() => window.location.reload());
    }

    reportTopic() {
      const user: ChromunityUser = this.state.user;

      if (user != null) {
        reportTopic(user, this.state.topic.id);
        window.location.reload();
      } else {
        window.location.replace("/user/account");
      }
    }

    renderAdminActions() {
      const user: ChromunityUser = this.state.user;
      if (user != null && this.state.representatives.includes(user.name) && !this.state.topic.removed) {
        return (
          <div style={{ display: "inline-block" }}>
            <IconButton aria-label="Remove topic" onClick={() => this.setState({ removeTopicDialogOpen: true })}>
              <Tooltip title="Remove topic">
                <Delete className={this.props.classes.iconRed} />
              </Tooltip>
            </IconButton>

            <Dialog
              open={this.state.removeTopicDialogOpen}
              onClose={() => this.setState({ removeTopicDialogOpen: false })}
              aria-labelledby="dialog-title"
            >
              <DialogTitle id="dialog-title">Are you sure?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This action will remove the topic, which makes sure that no one will be able to read the initial
                  message.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.setState({ removeTopicDialogOpen: false })} color="secondary">
                  No
                </Button>
                <Button
                  onClick={() =>
                    this.setState(
                      {
                        removeTopicDialogOpen: false
                      },
                      () =>
                        removeTopic(this.state.user, this.props.match.params.id).then(() => window.location.reload())
                    )
                  }
                  color="primary"
                >
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        );
      }
    }

    renderTopic() {
      return (
        <div className={this.state.topic.removed ? "removed" : ""}>
          <Card raised={true} key={this.state.topic.id} className="topic-card">
            {this.renderCardContent(this.state.topic.message)}
            {this.renderCardActions()}
          </Card>
          {this.state.replyBoxOpen ? this.renderReplyBox() : <div />}
        </div>
      );
    }

    renderReplyBox() {
      if (this.state.replyBoxOpen) {
        return <Card key={"reply-box"}>{this.renderReplyForm()}</Card>;
      }
    }

    toggleReplyBox(): void {
      this.setState(prevState => ({ replyBoxOpen: !prevState.replyBoxOpen }));
    }

    handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>): void {
      this.setState({ replyMessage: event.target.value });
    }

    renderReplyForm() {
      return (
        <div className="reply-container">
          <Container>
            <TextField
              margin="normal"
              id="message"
              multiline
              type="text"
              fullWidth
              value={this.state.replyMessage}
              onChange={this.handleReplyMessageChange}
            />
            <Button type="button" onClick={() => this.toggleReplyBox()}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => this.handleReplySubmit()}>
              Reply
            </Button>
            <br />
            <br />
          </Container>
        </div>
      );
    }

    handleReplySubmit(): void {
      this.retrieveLatestReplies();
      if (!this.state.subscribed) {
        subscribeToTopic(this.state.user, this.state.topic.id).then(() => this.setState({ subscribed: true }));
      }
    }

    renderReplyButton() {
      return (
        <ReplyTopicButton
          submitFunction={this.handleReplySubmit}
          topicId={this.props.match.params.id}
          topicAuthor={this.state.topic.author}
        />
      );
    }

    renderLoadMoreButton() {
      if (this.state.couldExistOlderReplies) {
        return <LoadMoreButton onClick={this.retrieveOlderReplies} />;
      }
    }

    render() {
      if (!this.state.mutedUsers.includes(this.state.topic.author)) {
        return (
          <Container fixed>
            <br />
            {this.state.isLoading ? <LinearProgress variant="query" /> : <div />}
            {this.renderTopic()}
            {this.state.topicReplies.length > 0 ? <SubdirectoryArrowRight /> : <div />}
            {this.state.topicReplies.map(reply => (
              <TopicReplyCard
                key={"reply-" + reply.id}
                reply={reply}
                indention={0}
                topicId={this.state.topic.id}
                representatives={this.state.representatives}
                mutedUsers={this.state.mutedUsers}
              />
            ))}
            {this.renderLoadMoreButton()}
            {this.renderReplyButton()}
          </Container>
        );
      } else {
        return <div />;
      }
    }
  }
);

export default FullTopic;
