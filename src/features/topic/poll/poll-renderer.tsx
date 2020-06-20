import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@material-ui/core';
import { connect } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { ChromunityUser, PollData } from '../../../types';
import { getPollVote, voteForOptionInPoll } from '../../../core/services/topic-service';
import ApplicationState from '../../../core/application-state';
import PollOptionStats from './poll-option-stats';
import PollOption from './poll-option';

interface Props {
  topicId: string;
  poll: PollData;
  user: ChromunityUser;
}

const useStyles = makeStyles((theme) => ({
  question: {
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  votes: {
    textAlign: 'center',
    color: theme.palette.primary.main,
    opacity: 0.6,
  },
}));

const PollRenderer: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  const [optionVote, setOptionVote] = useState<string>(null);

  useEffect(() => {
    if (props.topicId && props.user) {
      getPollVote(props.topicId, props.user).then((vote) => setOptionVote(vote || ''));
    } else if (!props.user) {
      setOptionVote('');
    }
  }, [props]);

  if (!props.poll) return null;

  function handleVote(voteAnswer: string) {
    if (props.user) {
      const answer = props.poll.options.find((a) => a.option === voteAnswer);

      if (answer) {
        answer.votes++;
        setOptionVote(answer.option);
        voteForOptionInPoll(props.user, props.topicId, answer.option).catch().then();
      }
    }
  }

  function renderStats(total: number) {
    return props.poll.options.map((option) => (
      <PollOptionStats
        key={option.option}
        text={option.option}
        votes={option.votes}
        total={total}
        selected={option.option === optionVote}
      />
    ));
  }

  function renderOptions() {
    return props.poll.options.map((option) => (
      <PollOption key={option.option} text={option.option} voteHandler={handleVote} />
    ));
  }

  if (props.poll != null && props.poll.question && props.poll.options.length > 0 && optionVote != null) {
    const total = props.poll.options.map((opt) => opt.votes).reduce((a, b) => a + b);
    return (
      <Card key="poll">
        <CardContent>
          <>
            <Typography component="p" variant="subtitle2" className={classes.question}>
              {props.poll.question}
            </Typography>
            {props.user && optionVote === '' ? renderOptions() : renderStats(total)}
            <Typography component="p" variant="subtitle1" className={classes.votes} gutterBottom>
              {total} {total === 1 ? 'vote' : 'votes'}
            </Typography>
          </>
        </CardContent>
      </Card>
    );
  }
  return null;
};

const mapStateToProps = (store: ApplicationState) => {
  return {
    user: store.account.user,
  };
};

export default connect(mapStateToProps, null)(PollRenderer);
