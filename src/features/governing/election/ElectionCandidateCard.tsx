import React, { useEffect, useState } from "react";
import { Button, Card, CardActions, CardContent, Grid, Tooltip, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import {
  getTimesUserDistrustedSomeone,
  getTimesUserWasDistrusted,
  getUserSettingsCached
} from "../../../core/services/UserService";
import { ifEmptyAvatarThenPlaceholder } from "../../../shared/util/user-util";
import Avatar, { AVATAR_SIZE } from "../../../shared/Avatar";
import { ChatBubble, Face, Favorite, SentimentVeryDissatisfiedSharp, Star, Report } from "@material-ui/icons";
import Badge from "@material-ui/core/Badge";
import { getTimesRepresentative } from "../../../core/services/RepresentativesService";
import {
  countRepliesByUser,
  countReplyStarRatingForUser,
  countTopicsByUser,
  countTopicStarRatingForUser
} from "../../../core/services/TopicService";
import { countUserFollowers } from "../../../core/services/FollowingService";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toLowerCase } from "../../../shared/util/util";
import { electionCandidateCardStyles } from "../sharedStyles";
import ApplicationState from "../../../core/application-state";
import { connect } from "react-redux";
import { ChromunityUser } from "../../../types";
import ConfirmDialog from "../../../shared/ConfirmDialog";
import { notifyError, notifyInfo } from "../../../core/snackbar/redux/snackbarActions";

interface Props {
  candidate: string;
  votedFor: string;
  voteForCandidate: Function;
  userIsEligibleToVote: boolean;
  user: ChromunityUser;
  notifyInfo: typeof notifyInfo;
  notifyError: typeof notifyError;
}

const ElectionCandidateCard: React.FunctionComponent<Props> = (props: Props) => {
  const classes = electionCandidateCardStyles(props);
  const [avatar, setAvatar] = useState<string>(null);
  const [timesRepresentative, setTimesRepresentative] = useState(0);
  const [topicRating, setTopicRating] = useState(0);
  const [replyRating, setReplyRating] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [topics, setTopics] = useState(0);
  const [replies, setReplies] = useState(0);
  const [distrusters, setDistrusters] = useState(0);
  const [distrusted, setDistrusted] = useState(0);
  const [voteConfirmOpen, setVoteConfirmOpen] = useState(false);

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
    return toLowerCase(props.candidate) === toLowerCase(props.votedFor);
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
            <Link className={classes.link} to={"/u/" + props.candidate}>
              @{props.candidate}
            </Link>
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
        </CardContent>
        <CardActions style={{ justifyContent: "center" }}>{renderCandidateCardActions(props.candidate)}</CardActions>
      </Card>
    </Grid>
  );

  function renderCandidateCardActions(name: string) {
    if (
      props.user == null ||
      toLowerCase(props.user.name) === toLowerCase(name) ||
      toLowerCase(name) === toLowerCase(props.votedFor) ||
      !props.userIsEligibleToVote
    ) {
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
            onCopy={() => props.notifyInfo("Copied to clipboard")}
          >
            <Button fullWidth size="small" variant="contained" color="secondary">
              Share Vote Link
            </Button>
          </CopyToClipboard>
        </div>
      );
    } else {
      return (
        <div>
          <ConfirmDialog
            text={`Are you sure you would like to vote for @${name}?`}
            subText={"You can always change your vote until the election completes."}
            open={voteConfirmOpen}
            onClose={() => setVoteConfirmOpen(false)}
            onConfirm={() => {
              setVoteConfirmOpen(false);
              props.voteForCandidate(name);
            }}
          />
          {props.user != null && toLowerCase(props.user.name) !== toLowerCase(name) ? (
            <Button
              fullWidth
              size="small"
              variant="contained"
              color="primary"
              onClick={() => setVoteConfirmOpen(true)}
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
              (window.location.port != null && window.location.port !== "" ? ":" + window.location.port : "") +
              "/gov/vote/" +
              name
            }
            onCopy={() => props.notifyInfo("Copied to clipboard")}
          >
            <Button fullWidth size="small" variant="contained" color="secondary">
              Share Vote Link
            </Button>
          </CopyToClipboard>
        </div>
      );
    }
  }
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

const mapDispatchToProps = {
  notifyError,
  notifyInfo
};

export default connect(mapStateToProps, mapDispatchToProps)(ElectionCandidateCard);
