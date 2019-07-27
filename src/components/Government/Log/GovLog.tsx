import React from 'react';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';
import { RepresentativeAction } from '../../../types';
import { getAllRepresentativeActionsPriorToTimestamp } from '../../../blockchain/RepresentativesService';
import { CardContent, Card, Container, Typography, LinearProgress } from '@material-ui/core';
import LoadMoreButton from "../../buttons/LoadMoreButton";

import './GovLog.css';
import { timeAgoReadable } from '../../../util/util';
import { parseContent } from '../../../util/text-parsing';

interface GovLogState {
    actions: RepresentativeAction[];
    isLoading: boolean;
    couldExistOlderActions: boolean;
}

const actionsPageSize = 25;

export class GovLog extends React.Component<{}, GovLogState> {

    constructor(props: any) {
        super(props);
        this.state = {
            actions: [],
            isLoading: true,
            couldExistOlderActions: false
        }

        this.retrieveActions = this.retrieveActions.bind(this);
    }

    componentDidMount() {
        this.retrieveActions();
    }

    render() {
        return (
            <Container>
                <ChromiaPageHeader text="Logbook" />
                {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                {this.state.actions.map(action => this.representativeActionCard(action))}
                {this.renderLoadMoreButton()}
            </Container>
        )
    }

    representativeActionCard(action: RepresentativeAction) {
        return (
            <Card key={action.id} className="gov-log-card">
                <CardContent>
                    <Typography className="topic-timestamp right" variant="body2" component="span">
                        {timeAgoReadable(action.timestamp)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" component="p">
                        <span dangerouslySetInnerHTML={{
                            __html: parseContent(action.action)
                        }}
                            style={{ whiteSpace: "pre-line" }} />
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    retrieveActions() {
        this.setState({ isLoading: true });
        const timestamp: number = this.state.actions.length !== 0 
            ? this.state.actions[this.state.actions.length - 1].timestamp 
            : Date.now();

        getAllRepresentativeActionsPriorToTimestamp(timestamp, actionsPageSize)
            .then(actions => {
                this.setState(prevState => ({ 
                    actions: Array.from(new Set(prevState.actions.concat(actions))),
                    isLoading: false,
                    couldExistOlderActions: actions.length >= actionsPageSize
                    }));
            }).catch(() => this.setState({ isLoading: false, couldExistOlderActions: false }));
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderActions) {
            return (<LoadMoreButton onClick={this.retrieveActions} />)
        }
    }

}
