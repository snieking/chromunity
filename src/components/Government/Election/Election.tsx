import React from 'react';

import {Link} from 'react-router-dom'

import './Election.css';
import {Button, Card, CardActions, CardContent, CardMedia, Container, Grid, Typography} from "@material-ui/core";
import Countdown from 'react-countdown-now';
import {
    getElectionCandidates,
    getElectionVoteForUser,
    getNextElectionTimestamp,
    signUpForElection,
    voteForCandidate
} from "../../../blockchain/ElectionService";
import {getUser, isGod} from "../../../util/user-util";
import {DictatorActions} from "./DictatorActions/DictatorActions";
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';
import {User} from '../../../types';

export interface ElectionState {
    timestamp: number,
    activeElection: boolean,
    electionId: string,
    votedFor: string,
    isACandidate: boolean,
    electionCandidates: string[]
}

// Renderer callback with condition
// @ts-ignore
const renderer = ({days, hours, minutes, seconds, completed}) => {
    if (completed) {
        // Render a completed state
        window.location.replace("/");
        return <div/>;
    } else {
        // Render a countdown
        return (
            <div className="countdown-wrapper">
                <Typography gutterBottom variant="h3" component="h3"
                            className="typography pink-typography">
                    {days}:{hours}:{minutes}.{seconds}
                </Typography>
            </div>
        );
    }
};

export class Election extends React.Component<{}, ElectionState> {

    constructor(props: any) {
        super(props);
        this.state = {
            activeElection: false,
            electionId: "",
            timestamp: Date.now(),
            votedFor: "",
            isACandidate: true,
            electionCandidates: []
        };
        this.renderElection = this.renderElection.bind(this);
    }

    componentDidMount(): void {
        getNextElectionTimestamp().then(election => {
            if (election != null) {
                const user = getUser();

                this.setState({
                    timestamp: election.timestamp,
                    activeElection: true,
                    electionId: election.id
                });

                getElectionCandidates()
                    .then(candidates => this.setState({
                        electionCandidates: candidates,
                        isACandidate: user != null && candidates.includes(user.name)
                    }));

                if (user != null) {
                    getElectionVoteForUser(user.name)
                        .then(candidate => {
                            if (candidate != null) {
                                this.setState({votedFor: candidate})
                            }
                        });
                }
            }
        });
    }

    renderElectionVoteStatus() {
        if (!this.state.activeElection) {
            return (
                <div>
                    <Typography gutterBottom variant="h5" component="h5"
                                className="typography pink-typography">
                        No election currently in progress
                    </Typography>
                </div>
            )
        } else if (this.state.votedFor !== "") {
            return (
                <div>
                    <Typography variant="body2" color="textSecondary" component="p">
                        You have done your duty as a citizen!
                    </Typography>
                </div>
            )
        } else {
            return (
                <div>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Until the election, cast your vote!
                    </Typography>
                </div>
            )
        }
    }

    renderParticipateButton() {
        const user: User = getUser();
        if (user != null && user.name != null && !this.state.isACandidate) {
            return (
                <Button fullWidth variant="contained" color="primary" onClick={() => this.registerForElection()}>
                    Participate
                </Button>
            )
        }
    }

    registerForElection() {
        signUpForElection(getUser())
            .then(() => this.setState({isACandidate: true}));
    }

    renderElection() {
        if (this.state.activeElection) {
            return (
                <Countdown
                    date={this.state.timestamp}
                    renderer={renderer}
                />
            )
        } else if (isGod()) {
            return (
                <DictatorActions/>
            )
        }
    }

    renderCandidateCard(name: string) {
        return (
            <Grid item xs={3}>
                <Card raised={true} key={"candidate-" + name}
                      className={this.state.votedFor === name ? "candidate-card voted-for" : "candidate-card"}>
                    <CardMedia
                        component="img"
                        alt="Election candidate"
                        height="140"
                        image="https://i.pravatar.cc/300"
                        title="Election candidate"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="subtitle1" component="h5">
                            <Link className="pink-typography" to={"/u/" + name}>@{name}</Link>
                        </Typography>
                    </CardContent>
                    <CardActions style={{justifyContent: 'center'}}>
                        {this.renderCandidateCardActions(name)}
                    </CardActions>
                </Card>
            </Grid>
        )
    }

    voteForCandidate(name: string) {
        voteForCandidate(getUser(), name)
            .then(() => this.setState({votedFor: name}));
    }

    renderCandidateCardActions(name: string) {
        if (name === this.state.votedFor) {
            return (
                <div>
                    <Button fullWidth size="small" variant="contained" color="secondary">
                        Share
                    </Button>
                </div>
            )
        } else {
            return (
                <div>
                    <Button fullWidth size="small" variant="contained" color="primary"
                            onClick={() => this.voteForCandidate(name)}>
                        Vote
                    </Button>
                    <Button fullWidth size="small" variant="contained" color="secondary">
                        Share
                    </Button>
                </div>
            )
        }
    }

    render() {
        return (
            <Container fixed maxWidth="md">
                <ChromiaPageHeader text="Election"/>
                <Card raised={true} key={"next-election"} className="election-card">
                    <CardContent>
                        {this.renderElection()}
                        {this.renderElectionVoteStatus()}
                    </CardContent>
                    <CardActions>
                        {this.renderParticipateButton()}
                    </CardActions>
                </Card>
                <Grid container spacing={1}>
                    {this.state.electionCandidates.map(candidate => this.renderCandidateCard(candidate))}
                </Grid>
            </Container>
        )
    }
}
