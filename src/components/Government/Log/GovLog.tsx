import React from 'react';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';
import { RepresentativeAction } from '../../../types';
import { getAllRepresentativeActionsPriorToTimestamp } from '../../../blockchain/RepresentativesService';
import { CardContent, Card, Container, Typography } from '@material-ui/core';

import './GovLog.css';
import { timeAgoReadable } from '../../../util/util';
import { parseContent } from '../../../util/text-parsing';

interface GovLogState {
    actions: RepresentativeAction[]
}

export class GovLog extends React.Component<{}, GovLogState> {

    constructor(props: any) {
        super(props);
        this.state = {
            actions: []
        }
    }

    componentDidMount() {
        getAllRepresentativeActionsPriorToTimestamp(Date.now(), 25)
            .then(actions => this.setState({ actions: actions }));
    }

    render() {
        return (
            <Container>
                <ChromiaPageHeader text="Logbook" />
                {this.state.actions.map(action => this.representativeActionCard(action))}
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
}
