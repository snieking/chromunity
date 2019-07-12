import React from 'react';

import { completeElection, getUncompletedElection, triggerElection, getElectionVotes } from "../../../../blockchain/ElectionService";
import { getUser } from "../../../../util/user-util";
import { Button } from "@material-ui/core";

export interface DictatorActionsState {
    electionId: string
}

const dayInMilliseconds: number = 10000;

export class DictatorActions extends React.Component<{}, DictatorActionsState> {

    constructor(props: any) {
        super(props);
        this.state = { electionId: "" };
    }

    componentDidMount(): void {
        getUncompletedElection()
            .then(electionId => {
                if (electionId != null) {
                    this.setState({ electionId: electionId });
                }
            })
    }

    completeElection() {
        getElectionVotes(this.state.electionId).then((candidates: string[]) => {
            completeElection(getUser(), this.state.electionId, candidates);
        })
    }

    render() {
        return (
            <div>
                <Button onClick={() => triggerElection(getUser(), Date.now() + (dayInMilliseconds * 7))} color="primary">Trigger election</Button>
                <Button onClick={() => this.completeElection()} color="primary">Complete election</Button>
            </div>
        )
    }
}
