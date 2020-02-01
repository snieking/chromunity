import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  Grid,
  makeStyles,
  Snackbar,
  Tooltip,
  Typography
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import { getUsername, ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";
import { ChatBubble, Face, Favorite, SentimentVeryDissatisfiedSharp, Star, Report } from "@material-ui/icons";
import Badge from "@material-ui/core/Badge";
import {
  getTimesRepresentative,
  getTimesUserDistrustedSomeone,
  getTimesUserWasDistrusted
} from "../../../blockchain/RepresentativesService";
import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser
} from "../../../blockchain/TopicService";
import { countUserFollowers } from "../../../blockchain/FollowingService";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toLowerCase } from "../../../util/util";

const useStyles = makeStyles(theme =>
  createStyles({
    votedFor: {
      border: "solid 3px",
      borderColor: theme.palette.secondary.main
    },
    candidateCard: {
      textAlign: "center"
    },
    statsDescr: {
      position: "relative",
      [theme.breakpoints.down("sm")]: {
        marginTop: "5px",
        display: "block"
      },
      [theme.breakpoints.up("md")]: {
        display: "inline",
        marginLeft: "15px"
      }
    },
    voteBtn: {
      marginBottom: "2px"
    }
  })
);

interface Props {
  candidate: string;
  votedFor: string;
  voteForCandidate: Function;
}

const ElectionCandidateCard: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);
  const [avatar, setAvatar] = useState<string>(null);
  const [timesRepresentative, setTimesRepresentative] = useState(0);
  const [topicRating, setTopicRating] = useState(0);
  const [replyRating, setReplyRating] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [topics, setTopics] = useState(0);
  const [replies, setReplies] = useState(0);
  const [distrusters, setDistrusters] = useState(0);
  const [distrusted, setDistrusted] = useState(0);

  const [snackbarOpen, setSnackBarOpen] = useState(false);

  const username = getUsername();

  useEffect(() => {
    getUserSettingsCached(props.candidate, 1440).then(settings =>
      setAvatar(ifEmptyAvatarThenPlaceholder(settings.avatar, props.candidate))
    );
    getTimesRepresentative(props.candidate).then(count => setTimesRepresentative(count));
    countTopicStarRatingForUser(props.candidate).then(count => setTopicRating(count));
    countReplyStarRatingForUser(props.candidate).then(count => setReplyRating(count));
    countUserFollowers(props.candidate).then(count => setFollowers(count));
    countTopicsByUser(props.candidate).then(count => setTopics(count));
    countRepliesByUser(props.candidate).then(count => setReplies(count));
    getTimesUserWasDistrusted(props.candidate).then(count => setDistrusters(count));
    getTimesUserDistrustedSomeone(props.candidate).then(count => setDistrusted(count));
  }, [props.candidate]);

  function votedFor(): boolean {
    return props.candidate === props.votedFor;
  }

  return (
    <Grid item xs={6} sm={6} md={3}>
      <Card
        key={"candidate-" + props.candidate}
        className={`${classes.candidateCard} ${votedFor() ? classes.votedFor : ""}`}
      >
        <CardContent>
          <Avatar src={avatar} size={AVATAR_SIZE.LARGE} name={props.candidate} />
          <Typography gutterBottom variant="h6" component="p">
            <Link to={"/u/" + props.candidate}>@{props.candidate}</Link>
          </Typography>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Tooltip title={"Number of times @" + props.candidate + " has won elections"}>
                <div>
                  <Badge badgeContent={timesRepresentative} color="secondary" showZero max={99999}>
                    <Face fontSize="large" />
                  </Badge>
                  <Typography variant="body2" component="span" className={classes.statsDescr}>
                    Elected
                  </Typography>
                </div>
              </Tooltip>
            </Grid>

            <Grid item xs={6}>
              <Tooltip title={"Number of star ratings that @" + props.candidate + " received"}>
                <div>
                  <Badge badgeContent={topicRating + replyRating} color="secondary" showZero max={99999}>
                    <Star fontSize="large" />
                  </Badge>
                  <Typography variant="body2" component="span" className={classes.statsDescr}>
                    Ratings
                  </Typography>
                </div>
              </Tooltip>
            </Grid>

            <Grid item xs={6}>
              <Tooltip title={"Number of users who follow @" + props.candidate}>
                <div>
                  <Badge badgeContent={followers} color="secondary" showZero max={99999}>
                    <Favorite fontSize="large" />
                  </Badge>
                  <Typography variant="body2" component="span" className={classes.statsDescr}>
                    Followers
                  </Typography>
                </div>
              </Tooltip>
            </Grid>

            <Grid item xs={6}>
              <Tooltip title={"Messages sent by @" + props.candidate}>
                <div>
                  <Badge badgeContent={topics + replies} color="secondary" showZero max={99999}>
                    <ChatBubble fontSize="large" />
                  </Badge>
                  <Typography variant="body2" component="span" className={classes.statsDescr}>
                    Messages
                  </Typography>
                </div>
              </Tooltip>
            </Grid>

            <Grid item xs={6}>
              <Tooltip title={"Users who doesn't trust @" + props.candidate + " as a representative"}>
                <div>
                  <Badge badgeContent={distrusters} color="secondary" showZero max={99999}>
                    <SentimentVeryDissatisfiedSharp fontSize="large" />
                  </Badge>
                  <Typography variant="body2" component="span" className={classes.statsDescr}>
                    Distrusts
                  </Typography>
                </div>
              </Tooltip>
            </Grid>

            <Grid item xs={6}>
              <Tooltip title={"Number of users that @" + props.candidate + " have distrusted"}>
                <div>
                  <Badge badgeContent={distrusted} color="secondary" showZero max={99999}>
                    <Report fontSize="large" />
                  </Badge>
                  <Typography variant="body2" component="span" className={classes.statsDescr}>
                    Distrusted
                  </Typography>
                </div>
              </Tooltip>
            </Grid>
          </Grid>
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackBarOpen(false)}
          >
            <CustomSnackbarContentWrapper variant="info" message="Copied to clipboard" />
          </Snackbar>
        </CardContent>
        <CardActions style={{ justifyContent: "center" }}>{renderCandidateCardActions(props.candidate)}</CardActions>
      </Card>
    </Grid>
  );

  function renderCandidateCardActions(name: string) {
    if (toLowerCase(name) === toLowerCase(props.votedFor)) {
      return (
        <div>
          <CopyToClipboard
            text={
              window.location.protocol +
              "//" +
              window.location.hostname +
              (window.location.port != null ? ":" + window.location.port : "") +
              "/gov/vote/" +
              name
            }
            onCopy={() => setSnackBarOpen(true)}
          >
            <Button fullWidth size="small" variant="outlined" color="secondary">
              Copy Vote Link
            </Button>
          </CopyToClipboard>
        </div>
      );
    } else {
      return (
        <div>
          {username != null && toLowerCase(username) !== toLowerCase(name) ? (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => props.voteForCandidate(name)}
              className={classes.voteBtn}
            >
              Vote
            </Button>
          ) : (
            <div />
          )}
          <CopyToClipboard
            text={
              window.location.protocol +
              "//" +
              window.location.hostname +
              (window.location.port != null ? ":" + window.location.port : "") +
              "/gov/vote/" +
              name
            }
            onCopy={() => setSnackBarOpen(true)}
          >
            <Button fullWidth size="small" variant="outlined" color="secondary">
              Copy Vote Link
            </Button>
          </CopyToClipboard>
        </div>
      );
    }
  }
};

export default ElectionCandidateCard;
