import React from 'react';

import './Representatives.css';
import { Container, Card, CardContent, TextField, Button } from "@material-ui/core";
import { getCurrentRepresentativePeriod, getRepresentatives } from "../../../blockchain/RepresentativesService";
import { Election } from "../../../types";
import RepresentativeCard from './RepresentativeCard/RepresentativeCard';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';
import { getUser } from '../../../util/user-util';
import { adminAddRepresentative, adminRemoveRepresentative } from '../../../blockchain/AdminService';

export interface RepresentativesState {
    mandatPeriodId: string;
    representatives: string[];
    targetUsername: string;
}

export class Representatives extends React.Component<{}, RepresentativesState> {

    constructor(props: any) {
        super(props);
        this.state = {
            representatives: [],
            mandatPeriodId: "",
            targetUsername: ""
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
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

    render() {
        return (
            <Container fixed maxWidth="md">
                <ChromiaPageHeader text="Representatives" />
                <div style={{ display: "flex" }}>
                    {this.state.representatives.map(name => <RepresentativeCard name={name} />)}
                </div>
                {this.renderAdminFunctions()}
            </Container>
        )
    }

    renderAdminFunctions() {
        if (getUser().name === "admin") {
            return (
                <div>
                    <br />
                    <Card>
                        <CardContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="username"
                                label="Username"
                                onChange={this.handleUsernameChange}
                                value={this.state.targetUsername}
                                className="text-field"
                                variant="outlined"
                            />
                            <br />
                            <Button onClick={() => adminRemoveRepresentative(getUser(), this.state.targetUsername)
                                .then(() => window.location.reload())} color="secondary" variant="outlined">
                                Remove representative
                            </Button>
                            <Button onClick={() => adminAddRepresentative(getUser(), this.state.targetUsername)
                                .then(() => window.location.reload())} color="primary" variant="outlined">
                                Add representative
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        }
    }

    handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ targetUsername: event.target.value });
    }
}
