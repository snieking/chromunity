import React from 'react';
import '../Wall.css';
import { Container, LinearProgress, FormGroup, FormControlLabel, Switch } from "@material-ui/core";
import { Topic, User } from "../../../types";

import { RouteComponentProps } from "react-router";
import { getTopicsByChannelPriorToTimestamp, getTopicsByChannelAfterTimestamp } from '../../../blockchain/TopicService';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import LoadMoreButton from '../../buttons/LoadMoreButton';
import { getUser } from '../../../util/user-util';
import { unfollowChannel, followChannel, getFollowedChannels } from '../../../blockchain/ChannelService';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';
import { getRepresentatives } from '../../../blockchain/RepresentativesService';
import { NewTopicButton } from '../../buttons/NewTopicButton';

interface MatchParams {
    channel: string
}

export interface ChannelWallProps extends RouteComponentProps<MatchParams> {

}

export interface ChannelWallState {
    topics: Topic[];
    representatives: string[];
    id: string;
    timestampOnOldestTopic: number;
    isLoading: boolean;
    couldExistOlderTopics: boolean;
    channelFollowed: boolean;
}

const topicsPageSize: number = 25;

export class ChannelWall extends React.Component<ChannelWallProps, ChannelWallState> {

    constructor(props: ChannelWallProps) {
        super(props);
        this.state = {
            topics: [],
            representatives: [],
            id: "",
            timestampOnOldestTopic: Date.now(),
            isLoading: true,
            couldExistOlderTopics: false,
            channelFollowed: false
        };

        this.retrieveTopics = this.retrieveTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    }

    componentDidMount(): void {
        this.retrieveTopics();
        getRepresentatives().then(representatives => this.setState({ representatives: representatives }));

        const user: User = getUser();
        if (user != null) {
            const channel = this.props.match.params.channel;
            getFollowedChannels(user.name).then(channels => this.setState({ channelFollowed: channels.includes(channel.toLocaleLowerCase()) }));
        }
    }

    retrieveTopics() {
        this.setState({ isLoading: true });
        const channel = this.props.match.params.channel;

        if (channel != null) {
            getTopicsByChannelPriorToTimestamp(channel, Date.now(), topicsPageSize)
                .then(retrievedTopics => {
                    this.setState(prevState => ({
                        topics: retrievedTopics.concat(prevState.topics),
                        isLoading: false,
                        couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                    }));
                });
        }
    }

    retrieveLatestTopics() {
        this.setState({ isLoading: true });
        const channel = this.props.match.params.channel;

        const timestamp: number = this.state.topics.length > 0 
            ? this.state.topics[this.state.topics.length - 1].timestamp 
            : Date.now();

        if (channel != null) {
            getTopicsByChannelAfterTimestamp(channel, timestamp)
            .then(retrievedTopics => {
                this.setState(prevState => ({
                    topics: retrievedTopics.concat(prevState.topics),
                    isLoading: false
                }));
            });
        }
    }

    toggleChannelFollow() {
        const channel = this.props.match.params.channel;
        if (this.state.channelFollowed) {
            unfollowChannel(getUser(), channel).then(() => this.setState({ channelFollowed: false }));
        } else {
            followChannel(getUser(), channel).then(() => this.setState({ channelFollowed: true }));
        }
    }

    renderFollowSwitch() {
        const user: User = getUser();
        if (user != null) {
            return (
                <FormGroup row>
                    <FormControlLabel className="switch-label"
                        control={
                            <Switch checked={this.state.channelFollowed}
                                onChange={() => this.toggleChannelFollow()}
                                value={this.state.channelFollowed}
                                className="switch" />
                        }
                        label="Follow channel"
                    />
                </FormGroup>
            )
        }
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({ isLoading: true });
            const channel = this.props.match.params.channel;
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;
            getTopicsByChannelPriorToTimestamp(channel, oldestTimestamp, topicsPageSize)
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
                        <ChromiaPageHeader text={"#" + this.props.match.params.channel} />
                        {this.renderFollowSwitch()}
                        {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                        {this.state.topics.map(topic => <TopicOverviewCard
                            key={topic.id}
                            topic={topic}
                            isRepresentative={this.state.representatives.includes(topic.author)}
                        />)}
                    </div>
                    {this.renderLoadMoreButton()}
                    {getUser() != null ? <NewTopicButton channel={this.props.match.params.channel} updateFunction={this.retrieveTopics} /> : <div></div>}
                </Container>
            </div>
        );
    }

}
