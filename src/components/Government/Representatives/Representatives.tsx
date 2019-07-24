import React from 'react';

import './Representatives.css';
import {Container} from "@material-ui/core";
import {getCurrentRepresentativePeriod, getRepresentatives} from "../../../blockchain/RepresentativesService";
import {Election} from "../../../types";
import RepresentativeCard from './RepresentativeCard/RepresentativeCard';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';

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

    render() {
        return (
            <Container fixed maxWidth="md">
                <ChromiaPageHeader text="Representatives"/>
                {this.state.representatives.map(name => <RepresentativeCard name={name}/>)}
            </Container>
        )
    }
}
