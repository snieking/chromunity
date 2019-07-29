import React from 'react';
import '../Wall.css';
import { Container, LinearProgress } from "@material-ui/core";
import { Topic } from "../../../types";

import { RouteComponentProps } from "react-router";
import { ProfileCard } from "../../user/Profile/ProfileCard";
import { getTopicsByUserPriorToTimestamp } from '../../../blockchain/TopicService';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import { SubdirectoryArrowRight } from '@material-ui/icons';
import LoadMoreButton from '../../buttons/LoadMoreButton';
import { getRepresentatives } from '../../../blockchain/RepresentativesService';

interface MatchParams {
    userId: string;
}

export interface UserWallProps extends RouteComponentProps<MatchParams> {

}

export interface UserWallState {
    topics: Topic[];
    representatives: string[];
    timestampOnOldestThread: number;
    isLoading: boolean;
    couldExistOlderTopics: boolean;
}

const topicsPageSize: number = 25;

export class UserWall extends React.Component<UserWallProps, UserWallState> {

    constructor(props: UserWallProps) {
        super(props);
        this.state = {
            topics: [],
            representatives: [],
            timestampOnOldestThread: Date.now(),
            isLoading: true,
            couldExistOlderTopics: false
        };

        this.retrieveTopics = this.retrieveTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
        this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
    }

    componentDidMount(): void {
        this.retrieveTopics();
        getRepresentatives().then(representatives => this.setState({ representatives: representatives }));
    }

    retrieveTopics() {
        this.setState({ isLoading: true });
        const userId = this.props.match.params.userId;
        if (userId != null) {
            getTopicsByUserPriorToTimestamp(userId, Date.now(), topicsPageSize)
                .then(retrievedTopics => {
                    this.setState(prevState => ({
                        topics: retrievedTopics.concat(prevState.topics),
                        isLoading: false,
                        couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                    }));
                }).catch(() => this.setState({ isLoading: false }));
        }
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({ isLoading: true });
            const userId = this.props.match.params.userId;
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;
            getTopicsByUserPriorToTimestamp(userId, oldestTimestamp, topicsPageSize)
                .then(retrievedTopics => {
                    if (retrievedTopics.length > 0) {
                        this.setState(prevState => ({
                            topics: prevState.topics.concat(retrievedTopics),
                            isLoading: false,
                            couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                        }));
                    } else {
                        this.setState({ isLoading: false, couldExistOlderTopics: false });
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
        if (this.state.couldExistOlderTopics) {
            return (<LoadMoreButton onClick={this.retrieveOlderTopics} />)
        }
    }

    render() {
        return (
            <div>
                <Container fixed maxWidth="md">
                    <div className="thread-wall-container">
                        {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                        {this.renderUserPageIntro()}
                        {this.state.topics.length > 0
                            ? (<SubdirectoryArrowRight className="nav-button button-center" />)
                            : (<div />)}
                        {this.state.topics.map(topic => <TopicOverviewCard 
                            topic={topic}
                            isRepresentative={this.state.representatives.includes(topic.author)}
                        />)}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
            </div>
        );
    }

}
