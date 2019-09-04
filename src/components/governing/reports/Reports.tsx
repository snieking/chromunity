import * as React from 'react';
import {RepresentativeReport} from "../../../types";
import {Container, LinearProgress} from '@material-ui/core';
import {getUnhandledReports} from '../../../blockchain/RepresentativesService';
import ReportCard from './ReportCard';
import ChromiaPageHeader from '../../common/ChromiaPageHeader';
import { initGA, pageView } from "../../../GoogleAnalytics";

type State = {
    reports: RepresentativeReport[];
    isLoading: boolean;
};

export class Reports extends React.Component<{}, State> {

    constructor(props: unknown) {
        super(props);
        this.state = {reports: [], isLoading: true}
    }

    componentDidMount() {
        getUnhandledReports()
            .then(reports => this.setState({reports: reports, isLoading: false}))
            .catch(() => this.setState({isLoading: false}));

        initGA();
        pageView();
    }

    render() {
        return (
            <Container>
                <ChromiaPageHeader text="Reports"/>
                {this.state.isLoading ? <LinearProgress variant="query"/> : <div></div>}
                {this.state.reports.map(report => <ReportCard key={report.id} report={report}/>)}
            </Container>
        );
    }
}