import React, { useEffect, useState } from "react";
import { ChromunityUser, PollData } from "../../../types";
import { Card, CardContent } from "@material-ui/core";
import { getPollVote, voteForOptionInPoll } from "../../../blockchain/TopicService";
import { ApplicationState } from "../../../store";
import { connect } from "react-redux";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PollOptionStats from "./PollOptionStats";
import Typography from "@material-ui/core/Typography";
import PollOption from "./PollOption";

interface Props {
  topicId: string;
  poll: PollData;
  user: ChromunityUser;
}

const useStyles = makeStyles(theme => ({
  votes: {
    textAlign: "center",
    color: theme.palette.primary.main,
    opacity: 0.6
  }
}));

const PollRenderer: React.FunctionComponent<Props> = props => {
  const classes = useStyles();
  const [optionVote, setOptionVote] = useState<string>(null);

  useEffect(() => {
    if (props.topicId && props.user) {
      getPollVote(props.topicId, props.user).then(vote => setOptionVote(vote ? vote : ""));
    } else if (!props.user) {
      setOptionVote("");
    }
  }, [props]);

  if (!props.poll) return null;

  function handleVote(voteAnswer: string) {
    if (props.user) {
      const answer = props.poll.options.find(answer => answer.option === voteAnswer);

      if (answer) {
        answer.votes++;
        setOptionVote(answer.option);
        voteForOptionInPoll(props.user, props.topicId, answer.option)
          .catch()
          .then();
      }
    }
  }

  function renderStats(total: number) {
    return props.poll.options.map(option => (
      <PollOptionStats
        text={option.option}
        votes={option.votes}
        total={total}
        selected={option.option === optionVote}
      />
    ));
  }

  function renderOptions() {
    return props.poll.options.map(option => <PollOption text={option.option} voteHandler={handleVote} />);
  }

  const total = props.poll != null && props.poll.options.length > 0 ? props.poll.options.map(opt => opt.votes).reduce((a, b) => a + b) : 0;

  if (optionVote != null) {
    return (
      <Card key="poll">
        <CardContent>
          <>
            <Typography component="h6" variant="h6" gutterBottom>
              {props.poll.question}
            </Typography>
            {props.user && optionVote === "" ? renderOptions() : renderStats(total)}
            {total > 0 && (<Typography component="p" variant="subtitle1" className={classes.votes} gutterBottom>
              {total} {total === 1 ? "vote" : "votes"}
            </Typography>)}
          </>
        </CardContent>
      </Card>
    );
  } else {
    return null;
  }
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user
  };
};

export default connect(mapStateToProps, null)(PollRenderer);
