import React from 'react';
import '../Wall.css';
import { Container, Button, LinearProgress } from "@material-ui/core";
import { Topic } from "../../../types";

import { RouteComponentProps } from "react-router";
import { ProfileCard } from "../../user/Profile/ProfileCard";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { chromiaTheme } from '../Wall';
import { getTopicsByUserPriorToTimestamp } from '../../../blockchain/TopicService';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import { SubdirectoryArrowRight } from '@material-ui/icons';

interface MatchParams {
    userId: string;
}

export interface UserWallProps extends RouteComponentProps<MatchParams> {

}

export interface UserWallState {
    topics: Topic[];
    timestampOnOldestThread: number;
    isLoading: boolean;
}

const theme = chromiaTheme();
const topicsPageLimit: number = 25;

export class UserWall extends React.Component<UserWallProps, UserWallState> {

    constructor(props: UserWallProps) {
        super(props);
        this.state = {
            topics: [],
            timestampOnOldestThread: Date.now(),
            isLoading: true
        };

        this.retrieveTopics = this.retrieveTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
        this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
    }

    componentDidMount(): void {
        this.retrieveTopics();
    }

    retrieveTopics() {
        this.setState({ isLoading: true });
        const userId = this.props.match.params.userId;
        if (userId != null) {
            getTopicsByUserPriorToTimestamp(userId, Date.now())
                .then(retrievedTopics => {
                    this.setState(prevState => ({
                        topics: retrievedTopics.concat(prevState.topics),
                        isLoading: false
                    }));
                });
        }
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({ isLoading: true });
            const userId = this.props.match.params.userId;
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;
            getTopicsByUserPriorToTimestamp(userId, oldestTimestamp)
                .then(retrievedTopics => {
                    if (retrievedTopics.length > 0) {
                        this.setState(prevState => ({
                            topics: prevState.topics.concat(retrievedTopics),
                            isLoading: false
                        }));
                    }
                });
        }
    }

    renderUserPageIntro() {
        if (this.props.match.params.userId != null) {
            return (
                <ProfileCard username={this.props.match.params.userId} />
            )
        }
    }

    renderLoadMoreButton() {
        if (this.state.topics.length >= topicsPageLimit &&
            this.state.topics.length % topicsPageLimit === 0) {
            return (
                <MuiThemeProvider theme={theme}>
                    <Button type="submit" fullWidth color="primary"
                        onClick={() => this.retrieveOlderTopics()}
                    >
                        Load more
                    </Button>
                </MuiThemeProvider>
            )
        }
    }

    render() {
        return (
            <div>
                <Container fixed maxWidth="md">
                    <div className="thread-wall-container">
                        <br />
                        {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                        {this.renderUserPageIntro()}
                        {this.state.topics.length > 0
                            ? (<SubdirectoryArrowRight className="nav-button button-center" />)
                            : (<div />)}
                        {this.state.topics.map(topic => <TopicOverviewCard topic={topic} />)}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
            </div>
        );
    }

}
