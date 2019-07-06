import React from 'react';

import {Link} from 'react-router-dom'

import './Representatives.css';
import {Card, CardContent, CardMedia, Container, Typography} from "@material-ui/core";
import {getCurrentRepresentativePeriod, getRepresentatives} from "../../../blockchain/RepresentativesService";
import {Election} from "../../../types";

export interface RepresentativesState {
    mandatPeriodId: string,
    representatives: string[]
}

export class Representatives extends React.Component<{}, RepresentativesState> {

    constructor(props: any) {
        super(props);
        this.state = {
            representatives: [],
            mandatPeriodId: ""
        };
    }

    componentDidMount(): void {
        getCurrentRepresentativePeriod().then((election: Election) => {
            if (election != null) {
                getRepresentatives(election.id).then((representatives: string[]) => this.setState({
                    mandatPeriodId: election.id,
                    representatives: representatives
                }));
            }
        });
    }

    renderRepresentativeCard(name: string) {
        return (
            <Card raised={true} key={"representative-" + name}
                  className="representative-card">
                <CardMedia
                    component="img"
                    alt="Election candidate"
                    height="140"
                    image="https://i.pravatar.cc/300"
                    title="Representative"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h5">
                        <Link className="pink-typography" to={"/u/" + name}>@{name}</Link>
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    render() {
        return (
            <Container fixed maxWidth="md">
                {this.state.representatives.map(name => this.renderRepresentativeCard(name))};
            </Container>
        )
    }
}
