import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  createStyles,
  Grid,
  makeStyles,
  Typography
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { getUserSettingsCached } from "../../../blockchain/UserService";
import { ifEmptyAvatarThenPlaceholder } from "../../../util/user-util";

const useStyles = makeStyles(theme =>
  createStyles({
    votedFor: {
      border: "solid 3px",
      borderColor: theme.palette.secondary.main
    },
    candidateCard: {
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

  useEffect(() => {
    getUserSettingsCached(props.candidate, 1440)
      .then(settings => setAvatar(ifEmptyAvatarThenPlaceholder(settings.avatar, props.candidate)));
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
        <CardMedia
          component="img"
          alt="Election candidate"
          height="140"
          image={avatar}
          title="Election candidate"
        />
        <CardContent>
          <Typography gutterBottom variant="subtitle1" component="h5">
            <Link to={"/u/" + props.candidate}>@{props.candidate}</Link>
          </Typography>
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