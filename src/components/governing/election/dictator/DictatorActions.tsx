import React from 'react';

import {completeElection, getElectionVotes, triggerElection} from "../../../../blockchain/ElectionService";
import {getAuthorizedUser} from "../../../../util/user-util";
import {Button} from "@material-ui/core";

export interface DictatorActionsState {

}

const dayInMilliseconds: number = 10000;

export class DictatorActions extends React.Component<{}, DictatorActionsState> {

    constructor(props: unknown) {
        super(props);
        this.state = {};
    }

    completeElection() {
        getElectionVotes().then((candidates: string[]) => {
            completeElection(getAuthorizedUser(), candidates);
        })
    }

    render() {
        return (
            <div>
                <Button onClick={() => triggerElection(getAuthorizedUser(), Date.now() + (dayInMilliseconds * 7))}
                        color="primary">Trigger election</Button>
                <Button onClick={() => this.completeElection()} color="primary">Complete election</Button>
            </div>
        )
    }
}
