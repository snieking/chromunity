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
  Typography
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import { getUsername, ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";
import { ChatBubble, Face, Favorite, Star } from "@material-ui/icons";
import Badge from "@material-ui/core/Badge";
import { getTimesRepresentative } from "../../../blockchain/RepresentativesService";
import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser
} from "../../../blockchain/TopicService";
import { countUserFollowers } from "../../../blockchain/FollowingService";
import { CustomSnackbarContentWrapper } from "../../common/CustomSnackbar";
import { CopyToClipboard } from "react-copy-to-clipboard";

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
      marginTop: "5px",
      marginBottom: "10px"
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
  }, [props.candidate]);

  function votedFor(): boolean {
    return props.candidate === props.votedFor;
  }

  return (
    <div>
      <Grid item xs={6} sm={6} md={6}>
        <Card
          raised={true}
          key={"candidate-" + props.candidate}
          className={`${classes.candidateCard} ${votedFor() ? classes.votedFor : ""}`}
        >
          <CardContent>
            <Avatar src={avatar} size={AVATAR_SIZE.LARGE} name={props.candidate} />
            <Typography gutterBottom variant="h6" component="h5">
              <Link to={"/u/" + props.candidate}>@{props.candidate}</Link>
            </Typography>
            <br />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Badge badgeContent={timesRepresentative} color="secondary" showZero max={99999}>
                  <Face fontSize="large" />
                </Badge>
                <Typography variant="body2" component="span" className={classes.statsDescr}>
                  Elected
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Badge badgeContent={topicRating + replyRating} color="secondary" showZero max={99999}>
                  <Star fontSize="large" />
                </Badge>
                <br />
                <Typography variant="body2" component="span" className={classes.statsDescr}>
                  Ratings
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Badge badgeContent={followers} color="secondary" showZero max={99999}>
                  <Favorite fontSize="large" />
                </Badge>
                <Typography variant="body2" component="span" className={classes.statsDescr}>
                  Followers
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Badge badgeContent={topics + replies} color="secondary" showZero max={99999}>
                  <ChatBubble fontSize="large" />
                </Badge>
                <Typography variant="body2" component="span" className={classes.statsDescr}>
                  Messages
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions style={{ justifyContent: "center" }}>{renderCandidateCardActions(props.candidate)}</CardActions>
        </Card>
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
    </div>
  );

  function renderCandidateCardActions(name: string) {
    if (name === props.votedFor) {
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
              Share
            </Button>
          </CopyToClipboard>
        </div>
      );
    } else {
      return (
        <div>
          {username != null && username.toLocaleUpperCase() !== name.toLocaleUpperCase() ? (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => props.voteForCandidate(name)}
            >
              Vote
            </Button>
          ) : (
            <div></div>
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
              Share
            </Button>
          </CopyToClipboard>
        </div>
      );
    }
  }
};

export default ElectionCandidateCard;
