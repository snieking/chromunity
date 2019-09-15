import React, { useEffect, useState } from "react";
import { Button, Card, CardActions, CardContent, createStyles, Grid, makeStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import { ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";
import Avatar, { AVATAR_SIZE } from "../../common/Avatar";
import { Face, Star } from "@material-ui/icons";
import Badge from "@material-ui/core/Badge";
import { getTimesRepresentative } from "../../../blockchain/RepresentativesService";
import { countReplyStarRatingForUser, countTopicStarRatingForUser } from "../../../blockchain/TopicService";

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
      [theme.breakpoints.up("xs")]: { left: 15 },
      [theme.breakpoints.only("sm")]: { left: 0 },
      textAlign: "center"
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

  useEffect(() => {
    getUserSettingsCached(props.candidate, 1440).then(settings =>
      setAvatar(ifEmptyAvatarThenPlaceholder(settings.avatar, props.candidate))
    );
    getTimesRepresentative(props.candidate).then(count => setTimesRepresentative(count));
    countTopicStarRatingForUser(props.candidate).then(count => setTopicRating(count));
    countReplyStarRatingForUser(props.candidate).then(count => setReplyRating(count));
  }, [props.candidate]);

  function votedFor(): boolean {
    return props.candidate === props.votedFor;
  }

  return (
    <Grid item xs={4}>
      <Card
        raised={true}
        key={"candidate-" + props.candidate}
        className={`${classes.candidateCard} ${votedFor() ? classes.votedFor : ""}`}
      >
        <CardContent>
          <Avatar src={avatar} size={AVATAR_SIZE.LARGE} />
          <Typography gutterBottom variant="subtitle1" component="h5">
            <Link to={"/u/" + props.candidate}>@{props.candidate}</Link>
          </Typography>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Badge badgeContent={timesRepresentative} color="secondary" showZero>
                <Face className="menu-item-button" />
              </Badge>
              <Typography variant="body1" component="span" className={classes.statsDescr}>
                Elected
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Badge badgeContent={topicRating + replyRating} color="secondary" showZero>
                <Star />
              </Badge>
              <Typography variant="body1" component="span" className={classes.statsDescr}>
                Ratings
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions style={{ justifyContent: "center" }}>{renderCandidateCardActions(props.candidate)}</CardActions>
      </Card>
    </Grid>
  );

  function renderCandidateCardActions(name: string) {
    if (name === props.votedFor) {
      return (
        <div>
          <Button fullWidth size="small" variant="outlined" color="secondary">
            Share
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => props.voteForCandidate(name)}
          >
            Vote
          </Button>
          <Button fullWidth size="small" variant="outlined" color="secondary">
            Share
          </Button>
        </div>
      );
    }
  }
};

export default ElectionCandidateCard;
