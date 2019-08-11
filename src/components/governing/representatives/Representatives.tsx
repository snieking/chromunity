import React from 'react';

import {Button, Card, CardContent, Container, Grid, TextField} from "@material-ui/core";
import {getRepresentatives} from "../../../blockchain/RepresentativesService";
import RepresentativeCard from './RepresentativeCard';
import ChromiaPageHeader from '../../common/ChromiaPageHeader';
import {getUser} from '../../../util/user-util';
import {adminAddRepresentative, adminRemoveRepresentative} from '../../../blockchain/AdminService';
import {User} from '../../../types';

export interface RepresentativesState {
    representatives: string[];
    targetUsername: string;
}

export class Representatives extends React.Component<{}, RepresentativesState> {

    constructor(props: unknown) {
        super(props);
        this.state = {
            representatives: [],
            targetUsername: ""
        };

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
    }

    componentDidMount(): void {
        getRepresentatives().then((representatives: string[]) => this.setState({
            representatives: representatives
        }));
    }

    render() {
        return (
            <Container fixed>
                <ChromiaPageHeader text="Representatives"/>
                <Grid container spacing={1}>
                    {this.state.representatives.map(name => <RepresentativeCard name={name} key={name}/>)}
                </Grid>
                {this.renderAdminFunctions()}
            </Container>
        )
    }

    renderAdminFunctions() {
        const user: User = getUser();
        if (user != null && user.name === "admin") {
            return (
                <div>
                    <br/>
                    <Card>
                        <CardContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="username"
                                label="Username"
                                onChange={this.handleUsernameChange}
                                value={this.state.targetUsername}
                                variant="outlined"
                            />
                            <br/>
                            <Button onClick={() => adminRemoveRepresentative(getUser(), this.state.targetUsername)
                                .then(() => window.location.reload())} variant="outlined">
                                Remove representative
                            </Button>
                            <Button onClick={() => adminAddRepresentative(getUser(), this.state.targetUsername)
                                .then(() => window.location.reload())} variant="outlined">
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
        this.setState({targetUsername: event.target.value});
    }
}
