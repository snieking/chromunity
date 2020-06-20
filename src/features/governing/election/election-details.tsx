import React, { useState, useEffect } from 'react';
import { Card, makeStyles, CardContent, CircularProgress, Typography } from '@material-ui/core';
import { blocksUntilElectionWrapsUp, blocksUntilNextElection } from '../../../core/services/election-service';
import { ElectionStatus } from './election-status';
import { useInterval } from '../../../shared/util/util';

interface Props {
  electionStatus: ElectionStatus;
}

const useStyles = makeStyles({
  electionCard: {
    textAlign: 'center',
    marginTop: '28px',
  },
});

const ElectionDetails: React.FunctionComponent<Props> = (props) => {
  const classes = useStyles();
  const [blocks, setBlocks] = useState(0);

  useEffect(() => {
    if (ElectionStatus.ONGOING === props.electionStatus) {
      blocksUntilElectionWrapsUp().then((b) => setBlocks(b));
    } else if (ElectionStatus.FINISHED === props.electionStatus) {
      blocksUntilNextElection().then((b) => setBlocks(b));
    }
  }, [props.electionStatus]);

  useInterval(() => {
    if (ElectionStatus.ONGOING === props.electionStatus) {
      blocksUntilElectionWrapsUp().then((b) => setBlocks(b));
    } else if (ElectionStatus.FINISHED === props.electionStatus) {
      blocksUntilNextElection().then((b) => setBlocks(b));
    }
  }, 30000);

  function content() {
    switch (props.electionStatus) {
      case ElectionStatus.NOT_CHECKED:
        return <CircularProgress />;
      case ElectionStatus.ONGOING:
        return ongoingElection();
      case ElectionStatus.FINISHED:
        return nextElection();
      default:
        return <div />;
    }
  }

  function ongoingElection() {
    return (
      <>
        {blocksCounter()}
        {description('blocks until the election wraps up')}
      </>
    );
  }

  function nextElection() {
    return (
      <>
        {blocksCounter()}
        {description('blocks until the next election starts')}
      </>
    );
  }

  function blocksCounter() {
    return (
      <Typography variant="h6" component="h6">
        {blocks}
      </Typography>
    );
  }

  function description(desc: string) {
    return (
      <Typography variant="body2" component="p">
        {desc}
      </Typography>
    );
  }

  return (
    <Card key="election-status" className={classes.electionCard}>
      <CardContent>{content()}</CardContent>
    </Card>
  );
};

export default ElectionDetails;
