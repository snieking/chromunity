import React from 'react';

import {completeElection, getUncompletedElection, triggerElection} from "../../../../blockchain/ElectionService";
import {getUser} from "../../../../util/user-util";
import {Button} from "@material-ui/core";

export interface DictatorActionsState {
    electionId: string
}

export class DictatorActions extends React.Component<{}, DictatorActionsState> {

    constructor(props: any) {
        super(props);
        this.state = { electionId: "" };
    }

    componentDidMount(): void {
        getUncompletedElection()
            .then(electionId => {
                if (electionId !=  null) {
                    this.setState({ electionId: electionId });
                }
            })
    }

    render() {
        return (
            <div>
                <Button onClick={() => triggerElection(getUser())} color="primary">Trigger election</Button>
                <Button onClick={() => completeElection(getUser(), this.state.electionId)} color="primary">Complete election</Button>
            </div>
        )
    }
}
