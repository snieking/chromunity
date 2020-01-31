import React from 'react';
import ChromiaPageHeader from '../common/ChromiaPageHeader';
import {RepresentativeAction} from '../../types';
import {
    getAllRepresentativeActionsPriorToTimestamp,
    updateLogbookLastRead
} from "../../blockchain/RepresentativesService";
import {Card, CardContent, Container, LinearProgress, Typography} from '@material-ui/core';
import LoadMoreButton from "../buttons/LoadMoreButton";
import {parseContent} from '../../util/text-parsing';
import Timestamp from "../common/Timestamp";
import { pageView } from "../../GoogleAnalytics";

interface GovLogState {
    actions: RepresentativeAction[];
    isLoading: boolean;
    couldExistOlderActions: boolean;
}

const actionsPageSize = 25;

export class GovLog extends React.Component<{}, GovLogState> {

    constructor(props: unknown) {
        super(props);
        this.state = {
            actions: [],
            isLoading: true,
            couldExistOlderActions: false
        };

        this.retrieveActions = this.retrieveActions.bind(this);
    }

    componentDidMount() {
        this.retrieveActions();
        pageView();
        updateLogbookLastRead(Date.now());
    }

    render() {
        return (
            <Container>
                <ChromiaPageHeader text="Logbook"/>
                {this.state.isLoading ? <LinearProgress variant="query"/> : <div/>}
                {this.state.actions.map(action => this.representativeActionCard(action))}
                {this.renderLoadMoreButton()}
            </Container>
        )
    }

    representativeActionCard(action: RepresentativeAction) {
        return (
            <Card key={action.id}>
                <CardContent>
                    <Timestamp milliseconds={action.timestamp}/>
                    <Typography variant="subtitle1" component="p">
                        <span dangerouslySetInnerHTML={{__html: parseContent(action.action)}}/>
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    retrieveActions() {
        this.setState({isLoading: true});
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
            }).catch(() => this.setState({isLoading: false, couldExistOlderActions: false}));
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderActions) {
            return (<LoadMoreButton onClick={this.retrieveActions}/>)
        }
    }

}
