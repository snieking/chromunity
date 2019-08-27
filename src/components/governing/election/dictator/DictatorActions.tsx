import React from "react";

import { completeElection, getElectionVotes, triggerElection } from "../../../../blockchain/ElectionService";
import { Button } from "@material-ui/core";
import { getUser } from "../../../../util/user-util";
import { ChromunityUser } from "../../../../types";

const dayInMilliseconds: number = 10000;

interface State {
  user: ChromunityUser;
}

class DictatorActions extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      user: getUser()
    };
  }

  completeElection() {
    getElectionVotes().then((candidates: string[]) => {
      completeElection(this.state.user, candidates);
    });
  }

  render() {
    return (
      <div>
        <Button onClick={() => triggerElection(this.state.user, Date.now() + dayInMilliseconds * 7)} color="primary">
          Trigger election
        </Button>
        <Button onClick={() => this.completeElection()} color="primary">
          Complete election
        </Button>
      </div>
    );
  }
}

export default DictatorActions;
