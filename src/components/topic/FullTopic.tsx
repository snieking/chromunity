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
  IconButton,
  LinearProgress,
  TextField,
  Theme,
  Tooltip,
  Typography,
  withStyles,
  WithStyles
} from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import EditMessageButton from "../buttons/EditMessageButton";
import {
  createTopicReply,
  deleteTopic,
  getTopicById,
  getTopicRepliesAfterTimestamp,
  getTopicRepliesPriorToTimestamp,
  getTopicStarRaters,
  getTopicSubscribers,
  giveTopicStarRating,
  modifyTopic,
  removeTopicStarRating,
  subscribeToTopic,
  unsubscribeFromTopic
} from "../../blockchain/TopicService";
import { Topic, TopicReply, ChromunityUser } from "../../types";
import { ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import {
  Delete,
  Notifications,
  NotificationsActive,
  Reply,
  Report,
  StarBorder,
  StarRate,
  SubdirectoryArrowRight
} from "@material-ui/icons";
import { getMutedUsers, getUserSettingsCached } from "../../blockchain/UserService";
import TopicReplyCard from "./TopicReplyCard";
import LoadMoreButton from "../buttons/LoadMoreButton";
import { reportTopic, removeTopic, hasReportId, REMOVE_TOPIC_OP_ID } from "../../blockchain/RepresentativesService";
import Timestamp from "../common/Timestamp";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import { COLOR_ORANGE, COLOR_RED, COLOR_YELLOW } from "../../theme";
import MarkdownRenderer from "../common/MarkdownRenderer";
import { toLowerCase } from "../../util/util";
import ConfirmDialog from "../common/ConfirmDialog";
import { ApplicationState } from "../../store";
import { connect } from "react-redux";
import EmojiPicker from "../common/EmojiPicker";
import logger from "../../util/logger";

const styles = (theme: Theme) =>
  createStyles({
    removed: {
      opacity: 0.25
    },
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
    content: {
      marginRight: "5px",
      whiteSpace: "normal",
      maxWidth: "95%"
    },
    userColor: {
      backgroundColor: theme.palette.secondary.main
    },
    repColor: {
      backgroundColor: COLOR_ORANGE
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

interface FullTopicProps extends RouteComponentProps<MatchParams>, WithStyles<typeof styles> {
  pathName: string;
  representatives: string[];
  user: ChromunityUser;
}

export interface FullTopicState {
  topic: Topic;
  notFound: boolean;
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
  reportTopicDialogOpen: boolean;
  mutedUsers: string[];
  timeLeftUntilNoLongerModifiable: number;
}

const repliesPageSize: number = 25;
const allowedEditTimeMillis: number = 300000;

const FullTopic = withStyles(styles)(
  class extends React.Component<FullTopicProps, FullTopicState> {
    private readonly textInput: React.RefObject<HTMLInputElement>;

    constructor(props: FullTopicProps) {
      super(props);

      const initialTopic: Topic = {
        id: "",
        title: "",
        overridden_original_title: "",
        author: "",
        message: "",
        overridden_original_message: "",
        timestamp: 0,
        last_modified: 0,
        removed: true,
        latest_poster: ""
      };

      this.state = {
        topic: initialTopic,
        notFound: false,
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
        reportTopicDialogOpen: false,
        mutedUsers: [],
        timeLeftUntilNoLongerModifiable: 0
      };

      this.textInput = React.createRef();

      this.retrieveLatestReplies = this.retrieveLatestReplies.bind(this);
      this.handleReplySubmit = this.handleReplySubmit.bind(this);
      this.retrieveOlderReplies = this.retrieveOlderReplies.bind(this);
      this.editTopicMessage = this.editTopicMessage.bind(this);
      this.closeReportTopic = this.closeReportTopic.bind(this);
      this.reportTopic = this.reportTopic.bind(this);
      this.isRepresentative = this.isRepresentative.bind(this);
      this.deleteTopic = this.deleteTopic.bind(this);
      this.toggleReplyBox = this.toggleReplyBox.bind(this);
      this.handleReplyMessageChange = this.handleReplyMessageChange.bind(this);
      this.addEmojiInReply = this.addEmojiInReply.bind(this);
    }

    componentDidMount(): void {
      const id = this.props.match.params.id;
      const user: ChromunityUser = this.props.user;

      if (user != null) {
        getMutedUsers(user).then(users => this.setState({ mutedUsers: users }));
      }

      getTopicById(id, user).then(topic => {
        logger.info("Topic returned: ", topic);
        if (topic != null) {
          this.consumeTopicData(topic);
        } else {
          this.setState({ notFound: true });
        }
      });
    }

    componentWillUnmount(): void {
      this.setState = () => {
        return;
      };
    }

    render() {
      if (!this.state.mutedUsers.includes(this.state.topic.author) && !this.state.notFound) {
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
                representatives={this.props.representatives}
                mutedUsers={this.state.mutedUsers}
              />
            ))}
            {this.renderLoadMoreButton()}
          </Container>
        );
      } else {
        return <Redirect to={"/"} />;
      }
    }

    consumeTopicData(topic: Topic): void {
      this.setState({ topic: topic });

      this.retrieveLatestReplies();
      getTopicStarRaters(topic.id, true).then(usersWhoStarRated =>
        this.setState({
          stars: usersWhoStarRated.length,
          ratedByMe: usersWhoStarRated.includes(this.props.user != null && this.props.user.name.toLocaleLowerCase())
        })
      );
      getTopicSubscribers(topic.id).then(subscribers =>
        this.setState({
          subscribed: this.props.user != null && subscribers.includes(this.props.user.name)
        })
      );

      getUserSettingsCached(topic.author, 86400).then(settings =>
        this.setState({
          avatar: ifEmptyAvatarThenPlaceholder(settings.avatar, topic.author)
        })
      );

      const modifiableUntil = topic.timestamp + allowedEditTimeMillis;

      setInterval(() => {
        this.setState({ timeLeftUntilNoLongerModifiable: this.getTimeLeft(modifiableUntil) });
      }, 1000);
    }

    getTimeLeft(until: number): number {
      const currentTime = Date.now();
      return currentTime < until ? Math.floor((until - currentTime) / 1000) : 0;
    }

    retrieveLatestReplies(): void {
      const topicId: string = this.props.match.params.id;
      this.setState({ isLoading: true });
      let replies: Promise<TopicReply[]>;
      if (this.state.topicReplies.length === 0) {
        replies = getTopicRepliesPriorToTimestamp(topicId, Date.now(), repliesPageSize, this.props.user);
      } else {
        replies = getTopicRepliesAfterTimestamp(
          topicId,
          this.state.topicReplies[0].timestamp,
          repliesPageSize,
          this.props.user
        );
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
        getTopicRepliesPriorToTimestamp(
          this.state.topic.id,
          oldestTimestamp - 1,
          repliesPageSize,
          this.props.user
        ).then(retrievedReplies => {
          if (retrievedReplies.length > 0) {
            this.setState(prevState => ({
              topicReplies: Array.from(new Set(prevState.topicReplies.concat(retrievedReplies))),
              isLoading: false,
              couldExistOlderReplies: retrievedReplies.length >= repliesPageSize
            }));
          } else {
            this.setState({ isLoading: false, couldExistOlderReplies: false });
          }
        });
      }
    }

    toggleStarRate() {
      if (!this.state.isLoading) {
        this.setState({ isLoading: true });
        const id: string = this.state.topic.id;
        const user: ChromunityUser = this.props.user;

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
          window.location.href = "/user/login";
        }
      }
    }

    toggleSubscription() {
      if (!this.state.isLoading) {
        this.setState({ isLoading: true });
        const id: string = this.state.topic.id;
        const user: ChromunityUser = this.props.user;

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
          window.location.href = "/user/login";
        }
      }
    }

    renderAuthor() {
      return (
        <div style={{ float: "right" }}>
          <Link
            className={`${this.props.classes.authorLink} ${
              this.props.representatives.includes(this.state.topic.author.toLocaleLowerCase())
                ? this.props.classes.repColor
                : this.props.classes.userColor
            }`}
            to={"/u/" + this.state.topic.author}
          >
            <Typography gutterBottom variant="subtitle1" component="span" className="typography">
              <span className={this.props.classes.authorName}>@{this.state.topic.author}</span>
            </Typography>
          </Link>
          <br />
          <div style={{ float: "right" }}>
            <Avatar src={this.state.avatar} size={AVATAR_SIZE.LARGE} name={this.state.topic.author} />
          </div>
        </div>
      );
    }

    renderCardContent(content: string) {
      return (
        <CardContent>
          {this.renderAuthor()}
          <div className={this.props.classes.content}>
            <Timestamp milliseconds={this.state.topic.timestamp} />
            <Typography gutterBottom variant="h6" component="h6">
              {this.state.topic.overridden_original_title !== "" && this.state.topic.removed
                ? this.state.topic.overridden_original_title
                : this.state.topic.title}
            </Typography>
            <MarkdownRenderer text={content} />
          </div>
        </CardContent>
      );
    }

    renderCardActions() {
      const user: ChromunityUser = this.props.user;
      return (
        <CardActions style={{ marginTop: "-20px" }}>
          <IconButton aria-label="Like" onClick={() => this.toggleStarRate()}>
            <Badge color="secondary" badgeContent={this.state.stars}>
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
            <EditMessageButton
              value={this.state.topic.message}
              modifiableUntil={this.state.timeLeftUntilNoLongerModifiable}
              editFunction={this.editTopicMessage}
              deleteFunction={this.deleteTopic}
            />
          ) : (
            <div />
          )}

          <IconButton onClick={this.toggleReplyBox}>
            <Tooltip title="Reply">
              <Reply className={this.state.replyBoxOpen ? this.props.classes.iconOrange : ""} />
            </Tooltip>
          </IconButton>

          <ConfirmDialog
            text="This action will report the topic"
            open={this.state.reportTopicDialogOpen}
            onClose={this.closeReportTopic}
            onConfirm={this.reportTopic}
          />

          <IconButton aria-label="Report-test" onClick={() => this.setState({ reportTopicDialogOpen: true })}>
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
      modifyTopic(this.props.user, this.state.topic.id, text)
        .then(() =>
          this.setState(prevState => ({
            topic: {
              id: prevState.topic.id,
              author: prevState.topic.author,
              title: prevState.topic.title,
              overridden_original_title: prevState.topic.overridden_original_title,
              message: text,
              overridden_original_message: prevState.topic.overridden_original_message,
              timestamp: prevState.topic.timestamp,
              last_modified: prevState.topic.last_modified,
              removed: prevState.topic.removed,
              latest_poster: prevState.topic.latest_poster
            },
            isLoading: false
          }))
        )
        .catch(() => this.setState({ isLoading: false }));
    }

    closeReportTopic() {
      this.setState({ reportTopicDialogOpen: false });
    }

    reportTopic() {
      this.closeReportTopic();
      const user: ChromunityUser = this.props.user;

      if (user != null) {
        reportTopic(user, this.state.topic.id).then();
        window.location.reload();
      } else {
        window.location.href = "/user/login";
      }
    }

    deleteTopic() {
      deleteTopic(this.props.user, this.state.topic.id).then(() => (window.location.href = "/"));
    }

    isRepresentative() {
      const user: ChromunityUser = this.props.user;
      return user != null && this.props.representatives.includes(user.name.toLocaleLowerCase());
    }

    renderAdminActions() {
      if (
        this.isRepresentative() &&
        !this.state.topic.removed &&
        !hasReportId(REMOVE_TOPIC_OP_ID + ":" + this.state.topic.id)
      ) {
        return (
          <div style={{ display: "inline-block" }}>
            <IconButton aria-label="Remove topic" onClick={() => this.setState({ removeTopicDialogOpen: true })}>
              <Tooltip title="Remove topic">
                <Delete className={this.props.classes.iconRed} />
              </Tooltip>
            </IconButton>

            <ConfirmDialog
              text={
                "This action will remove the topic, which makes sure that no one will be able to read the initial message."
              }
              open={this.state.removeTopicDialogOpen}
              onClose={() => this.setState({ removeTopicDialogOpen: false })}
              onConfirm={() =>
                this.setState(
                  {
                    removeTopicDialogOpen: false
                  },
                  () => removeTopic(this.props.user, this.props.match.params.id).then(() => window.location.reload())
                )
              }
            />
          </div>
        );
      }
    }

    renderTopic() {
      return (
        <div className={this.state.topic.removed ? this.props.classes.removed : ""}>
          <Card raised={true} key={this.state.topic.id}>
            {this.renderCardContent(
              this.state.topic.overridden_original_message !== "" && this.state.topic.removed
                ? this.state.topic.overridden_original_message
                : this.state.topic.message
            )}
            {this.renderCardActions()}
            {this.state.replyBoxOpen ? this.renderReplyForm() : <div />}
          </Card>
        </div>
      );
    }

    toggleReplyBox(): void {
      this.setState(prevState => ({ replyBoxOpen: !prevState.replyBoxOpen }));
    }

    handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>): void {
      this.setState({ replyMessage: event.target.value });
    }

    renderReplyForm() {
      return (
        <div style={{ margin: "15px", position: "relative" }}>
          <TextField
            label="Reply"
            margin="dense"
            variant="outlined"
            id="message"
            multiline
            type="text"
            rows="3"
            fullWidth
            value={this.state.replyMessage}
            onChange={this.handleReplyMessageChange}
            inputRef={this.textInput}
            autoFocus
          />
          <EmojiPicker emojiAppender={this.addEmojiInReply} btnSize="sm" />
          <div style={{ float: "right" }}>
            <Button type="button" onClick={() => this.toggleReplyBox()} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => this.handleReplySubmit()}
              color="primary"
              variant="outlined"
              style={{ marginLeft: "5px" }}
            >
              Reply
            </Button>
            <br />
            <br />
          </div>
        </div>
      );
    }

    addEmojiInReply(emoji: string) {
      const startPosition = this.textInput.current.selectionStart;

      this.setState(prevState => ({
        replyMessage: [
          prevState.replyMessage.slice(0, startPosition),
          emoji,
          prevState.replyMessage.slice(startPosition)
        ].join("")
      }));

      setTimeout(() => {
        this.textInput.current.selectionStart = startPosition + emoji.length;
        this.textInput.current.selectionEnd = startPosition + emoji.length;
      }, 100);
    }

    handleReplySubmit(): void {
      if (this.props.user != null) {
        this.setState({ isLoading: true, replyBoxOpen: false });
        createTopicReply(this.props.user, this.state.topic.id, this.state.replyMessage).then(() => {
          this.retrieveLatestReplies();
          this.setState({ replyMessage: "" });
        });
      }
    }

    renderLoadMoreButton() {
      if (this.state.couldExistOlderReplies) {
        return <LoadMoreButton onClick={this.retrieveOlderReplies} />;
      }
    }
  }
);

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map(rep => toLowerCase(rep))
  };
};

export default connect(mapStateToProps, null)(FullTopic);
