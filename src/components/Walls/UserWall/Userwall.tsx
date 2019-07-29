import React from 'react';
import '../Wall.css';
import { Container, LinearProgress, Tabs, Tab } from "@material-ui/core";
import { Topic, TopicReply } from "../../../types";

import { RouteComponentProps } from "react-router";
import { ProfileCard } from "../../user/Profile/ProfileCard";
import { getTopicsByUserPriorToTimestamp, getTopicRepliesByUserPriorToTimestamp } from '../../../blockchain/TopicService';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import { SubdirectoryArrowRight } from '@material-ui/icons';
import LoadMoreButton from '../../buttons/LoadMoreButton';
import { getRepresentatives } from '../../../blockchain/RepresentativesService';
import TopicReplyOverviewCard from '../../Topic/TopicReplyOverviewCard/TopicReplyOverviewCard';

interface MatchParams {
    userId: string;
}

export interface UserWallProps extends RouteComponentProps<MatchParams> {

}

export interface UserWallState {
    topics: Topic[];
    topicReplies: TopicReply[];
    representatives: string[];
    timestampOnOldestThread: number;
    isLoading: boolean;
    couldExistOlderTopics: boolean;
    couldExistOlderTopicReplies: boolean;
    activeTab: number;
}

const topicsPageSize: number = 25;

export class UserWall extends React.Component<UserWallProps, UserWallState> {

    constructor(props: UserWallProps) {
        super(props);
        this.state = {
            topics: [],
            topicReplies: [],
            representatives: [],
            timestampOnOldestThread: Date.now(),
            isLoading: true,
            couldExistOlderTopics: false,
            couldExistOlderTopicReplies: false,
            activeTab: 0
        };

        this.retrieveTopics = this.retrieveTopics.bind(this);
        this.retrieveTopicReplies = this.retrieveTopicReplies.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
        this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(): void {
        this.retrieveTopics();
        this.retrieveTopicReplies();
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

    retrieveTopicReplies() {
        this.setState({ isLoading: true });
        const userId = this.props.match.params.userId;

        const timestamp: number = this.state.topicReplies.length > 0 
            ? this.state.topicReplies[this.state.topicReplies.length -1].timestamp
            : Date.now();

        if (userId != null) {
            getTopicRepliesByUserPriorToTimestamp(userId, timestamp, topicsPageSize)
                .then(retrievedReplies => {
                    this.setState(prevState => ({
                        topicReplies: retrievedReplies.concat(prevState.topicReplies),
                        isLoading: false,
                        couldExistOlderTopicReplies: retrievedReplies.length >= topicsPageSize
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

    a11yProps(index: number) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    handleChange(event: React.ChangeEvent<{}>, newValue: number) {
        this.setState({ activeTab: newValue });
    }

    renderUserContent() {
        if (this.state.activeTab === 0) {
            return (
                this.state.topics.map(topic => <TopicOverviewCard
                    key={topic.id}
                    topic={topic}
                    isRepresentative={this.state.representatives.includes(topic.author)}
                />)
            )
        } else if (this.state.activeTab === 1) {
            return (
                this.state.topicReplies.map(reply => <TopicReplyOverviewCard
                        key={reply.id}
                        reply={reply}
                        isRepresentative={this.state.representatives.includes(reply.author)}
                    />)
            )
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
                        <Tabs value={this.state.activeTab} onChange={this.handleChange} aria-label="simple tabs example">
                            <Tab label="Topics" {...this.a11yProps(0)} style={styles.tab} />
                            <Tab label="Replies" {...this.a11yProps(1)} style={styles.tab} />
                        </Tabs>
                        {this.renderUserContent()}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
            </div>
        );
    }

}

const styles = {
    tab: {
        color: '#FFAFC1'
    }
}
