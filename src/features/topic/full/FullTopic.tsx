import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import { ChromunityUser, PollData, Topic, TopicReply } from "../../../types";
import { shouldBeFiltered, toLowerCase, useInterval } from "../../../shared/util/util";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  createStyles,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Delete, Notifications, NotificationsActive, Report, SubdirectoryArrowRight } from "@material-ui/icons";
import TopicReplyCard from "../TopicReplyCard";
import { Link, Redirect } from "react-router-dom";
import { ApplicationState } from "../../../core/store";
import { connect } from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { COLOR_ORANGE, COLOR_RED, COLOR_YELLOW } from "../../../theme";
import Timestamp from "../../../shared/Timestamp";
import MarkdownRenderer from "../../../shared/MarkdownRenderer";
import EditMessageButton from "../../../shared/buttons/EditMessageButton";
import ConfirmDialog from "../../../shared/ConfirmDialog";
import {
  hasReportedId,
  hasReportedTopic,
  REMOVE_TOPIC_OP_ID,
  removeTopic,
  reportTopic,
} from "../../../core/services/RepresentativesService";
import {
  createTopicReply,
  deleteTopic,
  getPoll,
  getTopicById,
  getTopicRepliesAfterTimestamp,
  getTopicRepliesPriorToTimestamp,
  getTopicStarRaters,
  getTopicSubscribers,
  giveTopicStarRating,
  modifyTopic,
  removeTopicStarRating,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "../../../core/services/TopicService";
import Divider from "@material-ui/core/Divider";
import TextToolbar from "../../../shared/textToolbar/TextToolbar";
import LoadMoreButton from "../../../shared/buttons/LoadMoreButton";
import { getUserSettingsCached } from "../../../core/services/UserService";
import { ifEmptyAvatarThenPlaceholder, markTopicReadInSession } from "../../../shared/util/user-util";
import Avatar, { AVATAR_SIZE } from "../../../shared/Avatar";
import PreviewLinks from "../../../shared/PreviewLinks";
import PageMeta from "../../../shared/PageMeta";
import PollRenderer from "../poll/PollRenderer";
import SocialShareButton from "../SocialShareButton";
import { setError, notifySuccess } from "../../../core/snackbar/redux/snackbarTypes";
import StarRating from "../../../shared/star-rating/StarRating";
import { setRateLimited, setOperationPending, setQueryPending } from "../../../shared/redux/CommonActions";
import FullTopicTutorial from "./FullTopicTutorial";
import ReplyButton from "../../../shared/buttons/ReplyButton";
import PinButton from "./PinButton";

interface MatchParams {
  id: string;
}

interface Props extends RouteComponentProps<MatchParams> {
  pathName: string;
  representatives: string[];
  distrustedUsers: string[];
  rateLimited: boolean;
  user: ChromunityUser;
  setError: typeof setError;
  setInfo: typeof notifySuccess;
  setRateLimited: typeof setRateLimited;
  setOperationPending: typeof setOperationPending;
  setQueryPending: typeof setQueryPending;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    removed: {
      opacity: 0.25,
    },
    authorName: {
      display: "block",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "5px",
    },
    authorLink: {
      float: "right",
      borderRadius: "0 0 0 5px",
      marginTop: "-18px",
      marginBottom: "7px",
      marginRight: "-16px",
    },
    content: {
      marginRight: "5px",
      whiteSpace: "normal",
      maxWidth: "95%",
    },
    userColor: {
      backgroundColor: theme.palette.secondary.main,
    },
    repColor: {
      backgroundColor: COLOR_ORANGE,
    },
    iconYellow: {
      color: COLOR_YELLOW,
    },
    iconOrange: {
      color: COLOR_ORANGE,
    },
    iconRed: {
      color: COLOR_RED,
    },
    ratingWrapper: {
      display: "inline",
    },
    cardActions: {
      width: "100%",
      display: "flex"
    }
  })
);

const FullTopic: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles();

  const [isLoading, setLoading] = useState(true);
  const [topic, setTopic] = useState<Topic>(null);
  const [notFound, setNotFound] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [topicReplies, setTopicReplies] = useState<TopicReply[]>([]);
  const [replyBoxOpen, setReplyBoxOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [couldExistOlderReplies, setCouldExistOlderReplies] = useState(false);
  const [removeTopicDialogOpen, setRemoveTopicDialogOpen] = useState(false);
  const [reportTopicDialogOpen, setReportTopicDialogOpen] = useState(false);
  const [timeLeftUntilNoLongerModifiable, setTimeLeftUntilNoLongerModifiable] = useState(0);
  const [poll, setPoll] = useState<PollData>(null);

  const textInput: React.RefObject<HTMLInputElement> = useRef();

  const repliesPageSize = 25;
  const allowedEditTimeMillis = 300000;

  useEffect(() => {
    const id = props.match.params.id;
    const user: ChromunityUser = props.user;

    props.setQueryPending(true);
    getTopicById(id, user)
      .then((topic) => {
        if (topic != null) {
          consumeTopicData(topic);
          markTopicReadInSession(topic.id);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        props.setQueryPending(false);
      });
    // eslint-disable-next-line
  }, [props.match.params.id]);

  function consumeTopicData(t: Topic): void {
    setTopic(t);

    retrieveLatestReplies();

    getPoll(t.id).then((poll) => setPoll(poll));
    getTopicSubscribers(t.id).then((subscribers) =>
      setSubscribed(props.user != null && subscribers.map((n) => toLowerCase(n)).includes(toLowerCase(props.user.name)))
    );

    getUserSettingsCached(t.author, 86400).then((settings) =>
      setAvatar(ifEmptyAvatarThenPlaceholder(settings.avatar, t.author))
    );

    const modifiableUntil = t.timestamp + allowedEditTimeMillis;

    setInterval(() => {
      setTimeLeftUntilNoLongerModifiable(getTimeLeft(modifiableUntil));
    }, 1000);
  }

  useInterval(() => {
    retrieveLatestReplies(false);
  }, 10000);

  function getTimeLeft(until: number): number {
    const currentTime = Date.now();
    return currentTime < until ? Math.floor((until - currentTime) / 1000) : 0;
  }

  function retrieveLatestReplies(notifyLoading: boolean = true): void {
    setLoading(true);
    props.setQueryPending(notifyLoading);
    const topicId: string = props.match.params.id;
    let replies: Promise<TopicReply[]>;
    if (topicReplies.length === 0) {
      replies = getTopicRepliesPriorToTimestamp(topicId, Date.now(), repliesPageSize, props.user);
    } else {
      replies = getTopicRepliesAfterTimestamp(topicId, topicReplies[0].timestamp, repliesPageSize, props.user);
    }

    replies
      .then((retrievedReplies) => {
        if (retrievedReplies.length > 0) {
          setTopicReplies(Array.from(new Set(retrievedReplies.concat(topicReplies))));
          setCouldExistOlderReplies(retrievedReplies.length >= repliesPageSize);
        }
      })
      .catch()
      .finally(() => {
        setLoading(false);
        props.setQueryPending(false);
      });
  }

  function renderTopic() {
    const filtered = shouldBeFiltered(topic.moderated_by, props.distrustedUsers);
    const authorIsMe = props.user != null && toLowerCase(topic.author) === toLowerCase(props.user.name);
    const iAmRepresentative = props.user != null && props.representatives.includes(toLowerCase(props.user.name));

    if (authorIsMe || iAmRepresentative || !filtered) {
      return (
        <div className={filtered ? classes.removed : ""}>
          <PageMeta title={topic ? topic.title : null} description={topic ? topic.message : null} />
          <Card raised={true} key={topic.id}>
            {renderCardContent()}
            {renderCardActions()}
            {replyBoxOpen ? renderReplyForm() : <div />}
          </Card>
        </div>
      );
    }
  }

  function renderCardContent() {
    return (
      <CardContent>
        {renderAuthor()}
        <div className={classes.content}>
          <Timestamp milliseconds={topic.timestamp} />
          <Typography gutterBottom variant="h6" component="h6">
            {topic.title}
          </Typography>
          <MarkdownRenderer text={topic.message} />
          <PreviewLinks text={topic ? topic.message : null} />
        </div>
      </CardContent>
    );
  }

  function renderAuthor() {
    return (
      <div style={{ float: "right" }}>
        <Link
          className={`${classes.authorLink} ${
            props.representatives.includes(topic.author.toLocaleLowerCase()) ? classes.repColor : classes.userColor
          }`}
          to={"/u/" + topic.author}
        >
          <Typography gutterBottom variant="subtitle1" component="span" className="typography">
            <span className={classes.authorName}>@{topic.author}</span>
          </Typography>
        </Link>
        <br />
        <div style={{ float: "right" }}>
          <Avatar src={avatar} size={AVATAR_SIZE.LARGE} name={topic.author} />
        </div>
      </div>
    );
  }

  function renderCardActions() {
    const user: ChromunityUser = props.user;
    const id: string = props.match.params.id;

    if (user != null) {
      return (
        <CardActions disableSpacing className={classes.cardActions}>
          <div className={classes.ratingWrapper}>
            <StarRating
              starRatingFetcher={() => getTopicStarRaters(id)}
              incrementRating={() => giveTopicStarRating(user, id)}
              removeRating={() => removeTopicStarRating(user, id)}
            />
          </div>
          <IconButton
            data-tut="subscribe_btn"
            aria-label="Subscribe"
            onClick={() => toggleSubscription()}
            disabled={props.rateLimited}
          >
            {subscribed ? (
              <Tooltip title="Unsubscribe">
                <NotificationsActive className={classes.iconOrange} />
              </Tooltip>
            ) : (
              <Tooltip title="Subscribe">
                <Notifications />
              </Tooltip>
            )}
          </IconButton>

          {topic.timestamp + allowedEditTimeMillis > Date.now() &&
          user != null &&
          toLowerCase(topic.author) === toLowerCase(user.name) ? (
            <EditMessageButton
              value={topic.message}
              modifiableUntil={timeLeftUntilNoLongerModifiable}
              editFunction={editTopicMessage}
              deleteFunction={deleteTheTopic}
            />
          ) : (
            <div style={{ display: "inline" }} />
          )}

          <PinButton topicId={topic.id} />

          <ConfirmDialog
            text="This action will report the topic"
            open={reportTopicDialogOpen}
            onClose={closeReportTopic}
            onConfirm={reportTheTopic}
          />

          {!isRepresentative() && !hasReportedTopic(user, topic) && (
            <IconButton
              data-tut="report_btn"
              aria-label="Report-test"
              onClick={() => setReportTopicDialogOpen(true)}
              disabled={props.rateLimited}
            >
              <Tooltip title="Report">
                <Report />
              </Tooltip>
            </IconButton>
          )}

          <SocialShareButton text={topic.title} />

          {renderAdminActions()}
          <ReplyButton onClick={toggleReplyBox} toggled={replyBoxOpen} size="medium" />
        </CardActions>
      );
    } else {
      return (
        <CardActions>
          <div className={classes.ratingWrapper}>
            <StarRating starRatingFetcher={() => getTopicStarRaters(props.match.params.id)} />
          </div>
          <SocialShareButton text={topic.title} />
        </CardActions>
      );
    }
  }

  function toggleSubscription() {
    if (!isLoading) {
      setLoading(true);
      props.setOperationPending(true);
      const id: string = topic.id;
      const user: ChromunityUser = props.user;

      if (user != null) {
        if (subscribed) {
          unsubscribeFromTopic(user, id)
            .then(() => setSubscribed(false))
            .catch((error) => {
              setError(error.message);
              setRateLimited();
            })
            .finally(() => {
              setLoading(false);
              props.setOperationPending(false);
            });
        } else {
          subscribeToTopic(user, id)
            .then(() => setSubscribed(true))
            .catch((error) => {
              setError(error.message);
              setRateLimited();
            })
            .finally(() => {
              setLoading(false);
              props.setOperationPending(false);
            });
        }
      } else {
        window.location.href = "/user/login";
      }
    }
  }

  function editTopicMessage(text: string) {
    if (!isLoading) {
      setLoading(true);
      props.setOperationPending(true);
      modifyTopic(props.user, topic.id, text)
        .then(() => {
          const updatedTopic: Topic = {
            id: topic.id,
            author: topic.author,
            title: topic.title,
            message: text,
            timestamp: topic.timestamp,
            last_modified: topic.last_modified,
            latest_poster: topic.latest_poster,
            moderated_by: topic.moderated_by,
          };

          setTopic(updatedTopic);
        })
        .catch((error) => {
          setError(error.message);
          setRateLimited();
        })
        .finally(() => {
          setLoading(false);
          props.setOperationPending(false);
        });
    }
  }

  function deleteTheTopic() {
    props.setOperationPending(true);
    deleteTopic(props.user, topic.id)
      .catch((error) => {
        setError(error.message);
        setRateLimited();
      })
      .then(() => (window.location.href = "/"))
      .finally(() => props.setOperationPending(false));
  }

  function closeReportTopic() {
    setReportTopicDialogOpen(false);
  }

  function reportTheTopic() {
    closeReportTopic();
    const user: ChromunityUser = props.user;

    if (user != null) {
      reportTopic(user, topic)
        .catch((error) => {
          setError(error.message);
          setRateLimited();
        })
        .then();
    } else {
      window.location.href = "/user/login";
    }
  }

  function isRepresentative() {
    const user: ChromunityUser = props.user;
    return user != null && props.representatives.includes(toLowerCase(user.name));
  }

  function renderAdminActions() {
    if (isRepresentative() && !hasReportedId(REMOVE_TOPIC_OP_ID + ":" + topic.id)) {
      return (
        <div style={{ display: "inline-block" }}>
          <IconButton aria-label="Remove topic" onClick={() => setRemoveTopicDialogOpen(true)}>
            <Tooltip title="Remove topic">
              <Delete className={classes.iconRed} />
            </Tooltip>
          </IconButton>

          <ConfirmDialog
            text={
              "This action will remove the topic, which makes sure that no one will be able to read the initial message."
            }
            open={removeTopicDialogOpen}
            onClose={() => setRemoveTopicDialogOpen(false)}
            onConfirm={() => {
              setRemoveTopicDialogOpen(false);
              removeTopic(props.user, topic.id)
                .catch((error) => {
                  setError(error.message);
                  setRateLimited();
                })
                .then(() => window.location.reload());
            }}
          />
        </div>
      );
    }
  }

  function renderReplyForm() {
    return (
      <div style={{ margin: "15px", position: "relative" }}>
        <Divider />
        <TextToolbar addText={addTextFromToolbarInReply} />
        <TextField
          label="Reply"
          margin="dense"
          variant="outlined"
          id="message"
          multiline
          type="text"
          rows="3"
          rowsMax="10"
          fullWidth
          value={replyMessage}
          onChange={handleReplyMessageChange}
          inputRef={textInput}
          autoFocus
        />
        <div style={{ float: "right" }}>
          <Button type="button" onClick={() => toggleReplyBox()} color="secondary" variant="contained">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleReplySubmit}
            color="primary"
            variant="contained"
            style={{ marginLeft: "5px" }}
            disabled={props.rateLimited}
          >
            Reply
          </Button>
          <br />
          <br />
        </div>
      </div>
    );
  }

  function toggleReplyBox(): void {
    setReplyBoxOpen(!replyBoxOpen);
  }

  function addTextFromToolbarInReply(text: string) {
    const startPosition = textInput.current.selectionStart;

    setReplyMessage([replyMessage.slice(0, startPosition), text, replyMessage.slice(startPosition)].join(""));

    setTimeout(() => {
      textInput.current.selectionStart = startPosition + text.length;
      textInput.current.selectionEnd = startPosition + text.length;
    }, 100);
  }

  function handleReplyMessageChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setReplyMessage(event.target.value);
  }

  function handleReplySubmit(): void {
    if (props.user != null) {
      setReplyBoxOpen(false);
      setLoading(true);
      props.setOperationPending(true);
      createTopicReply(props.user, topic.id, replyMessage)
        .catch((error) => {
          setError(error.message);
          setRateLimited();
        })
        .then(() => {
          props.setInfo("Reply sent");
          retrieveLatestReplies();
          setReplyMessage("");
        })
        .finally(() => {
          setLoading(false);
          props.setOperationPending(false);
        });
    }
  }

  function renderLoadMoreButton() {
    if (couldExistOlderReplies) {
      return <LoadMoreButton onClick={retrieveOlderReplies} />;
    }
  }

  function retrieveOlderReplies() {
    if (topicReplies.length > 0) {
      setLoading(true);
      const oldestTimestamp: number = topicReplies[topicReplies.length - 1].timestamp;
      getTopicRepliesPriorToTimestamp(topic.id, oldestTimestamp - 1, repliesPageSize, props.user)
        .then((retrievedReplies) => {
          if (retrievedReplies.length > 0) {
            setTopicReplies(Array.from(new Set(topicReplies.concat(retrievedReplies))));
            setCouldExistOlderReplies(retrievedReplies.length >= repliesPageSize);
          } else {
            setCouldExistOlderReplies(false);
          }
        })
        .finally(() => setLoading(false));
    }
  }

  const distrustedUser =
    topic != null && props.distrustedUsers.map((n) => toLowerCase(n)).includes(toLowerCase(topic.author));
  const iAmRep = props.user != null && props.representatives.includes(toLowerCase(props.user.name));

  if (topic != null && (iAmRep || !distrustedUser) && !notFound) {
    return (
      <Container fixed>
        <br />
        {renderTopic()}
        <PollRenderer topicId={topic.id} poll={poll} />
        {topicReplies.length > 0 ? <SubdirectoryArrowRight /> : <div />}
        {topicReplies.map((reply) => (
          <TopicReplyCard
            key={"reply-" + reply.id}
            reply={reply}
            indention={0}
            topicId={topic.id}
            representatives={props.representatives}
          />
        ))}
        {renderLoadMoreButton()}
        <FullTopicTutorial />
      </Container>
    );
  } else if (notFound) {
    return <Redirect to={"/"} />;
  } else if (distrustedUser && !isLoading) {
    return (
      <Container fixed style={{ textAlign: "center" }}>
        <br />
        <Typography component="h6" variant="h6">
          You have distrusted the author <a href={`/u/${topic.author}`}>@{topic.author}</a>
        </Typography>
        <Typography>
          The contents of this topic is filtered since you have choosen to distrust the author of it.
        </Typography>
      </Container>
    );
  } else {
    return <LinearProgress variant="query" />;
  }
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
    representatives: store.government.representatives.map((rep) => toLowerCase(rep)),
    distrustedUsers: store.account.distrustedUsers,
    rateLimited: store.common.rateLimited,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setError: (msg: string) => dispatch(setError(msg)),
    setInfo: (msg: string) => dispatch(notifySuccess(msg)),
    setRateLimited: () => dispatch(setRateLimited()),
    setOperationPending: (pending: boolean) => dispatch(setOperationPending(pending)),
    setQueryPending: (pending: boolean) => dispatch(setQueryPending(pending)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FullTopic);
