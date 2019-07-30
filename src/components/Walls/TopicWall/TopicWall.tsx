import React from 'react';
import { Topic } from '../../../types';
import { getTopicsPriorToTimestamp, getTopicsAfterTimestamp, getTopicsFromFollowsPriorToTimestamp, getTopicsFromFollowsAfterTimestamp, getTopicsFromFollowedChannelsPriorToTimestamp } from '../../../blockchain/TopicService';
import { LinearProgress, Container } from '@material-ui/core';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import { NewTopicButton } from '../../buttons/NewTopicButton';
import { getUser } from '../../../util/user-util';
import LoadMoreButton from '../../buttons/LoadMoreButton';
import { TrendingChannels } from '../../TrendingTags/TrendingTags';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';
import { getRepresentatives } from '../../../blockchain/RepresentativesService';

interface Props {
    type: string;
}

interface State {
    topics: Topic[];
    representatives: string[];
    isLoading: boolean;
    couldExistOlderTopics: boolean;
}

const topicsPageSize: number = 25;

class TopicWall extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            topics: [],
            representatives: [],
            isLoading: true,
            couldExistOlderTopics: false
        };

        this.retrieveLatestTopics = this.retrieveLatestTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderTopics) {
            return (<LoadMoreButton onClick={this.retrieveOlderTopics} />)
        }
    }

    getHeader() {
        if (this.props.type === "userFollowings") {
            return "Followed Users";
        } else if (this.props.type === "tagFollowings") {
            return "Trending Channels";
        } else {
            return "Recent Topics"
        }
    }

    render() {
        return (
            <div>
                <Container fixed>
                    <ChromiaPageHeader text={this.getHeader()} />
                    {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                    {this.props.type === "tagFollowings" ? <TrendingChannels /> : <div></div>}
                    <div className='topic-wall-container'>
                        {this.props.type === "tagFollowings" ? <ChromiaPageHeader text="Followed Channels" /> : <div></div>}
                        {this.state.topics.map(topic => <TopicOverviewCard
                            key={'card-' + topic.id}
                            topic={topic}
                            isRepresentative={this.state.representatives.includes(topic.author)}
                        />)}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
                {getUser() != null ? <NewTopicButton channel="general" updateFunction={this.retrieveLatestTopics} /> : <div></div>}
            </div>
        );
    }

    componentDidMount() {
        this.retrieveLatestTopics();
        getRepresentatives().then(representatives => this.setState({ representatives: representatives }));
    }

    retrieveLatestTopicsForAll() {
        var topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsPriorToTimestamp(Date.now(), topicsPageSize);
        } else {
            topics = getTopicsAfterTimestamp(this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => this.appendLatestTopics(retrievedTopics))
            .catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveLatestTopicsForUserFollowings() {
        var topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsFromFollowsPriorToTimestamp(getUser(), Date.now(), topicsPageSize);
        } else {
            topics = getTopicsFromFollowsAfterTimestamp(getUser(), this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => this.appendLatestTopics(retrievedTopics))
            .catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveLatestTopicsForTagFollowings() {
        var topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsFromFollowedChannelsPriorToTimestamp(getUser(), Date.now(), topicsPageSize);
        } else {
            topics = getTopicsFromFollowedChannelsPriorToTimestamp(getUser(), this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => this.appendLatestTopics(retrievedTopics))
            .catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    appendLatestTopics(topics: Topic[]) {
        if (topics.length > 0) {
            this.setState(prevState => ({
                topics: Array.from(new Set(topics.concat(prevState.topics))),
                isLoading: false,
                couldExistOlderTopics: topics.length >= topicsPageSize
            }));
        } else {
            this.setState({ isLoading: false, couldExistOlderTopics: false });
        }
    }

    retrieveLatestTopics() {
        this.setState({ isLoading: true });

        if (this.props.type === "userFollowings") {
            this.retrieveLatestTopicsForUserFollowings();
        } else if (this.props.type === "tagFollowings") {
            this.retrieveLatestTopicsForTagFollowings();
        } else {
            this.retrieveLatestTopicsForAll();
        }
    }

    retrieveOlderTopicsForUserFollowings(oldestTimestamp: number) {
        getTopicsFromFollowsPriorToTimestamp(getUser(), oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => this.appendOlderTopics(retrievedTopics))
            .catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveOlderTopicsForTagFollowings(oldestTimestamp: number) {
        getTopicsFromFollowedChannelsPriorToTimestamp(getUser(), oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => this.appendOlderTopics(retrievedTopics))
            .catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    retrieveOlderTopicsForAll(oldestTimestamp: number) {
        getTopicsPriorToTimestamp(oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => this.appendOlderTopics(retrievedTopics))
            .catch(() => this.setState({ isLoading: false, couldExistOlderTopics: false }));
    }

    appendOlderTopics(topics: Topic[]) {
        if (topics.length > 0) {
            this.setState(prevState => ({
                topics: Array.from(new Set(prevState.topics.concat(topics))),
                isLoading: false,
                couldExistOlderTopics: topics.length >= topicsPageSize
            }));
        } else {
            this.setState({ isLoading: false, couldExistOlderTopics: false });
        }
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({ isLoading: true });
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;

            if (this.props.type === "userFollowings") {
                this.retrieveOlderTopicsForUserFollowings(oldestTimestamp);
            } else if (this.props.type === "tagFollowings") {
                this.retrieveOlderTopicsForTagFollowings(oldestTimestamp);
            } else {
                this.retrieveOlderTopicsForAll(oldestTimestamp);
            }
        }
    }
}

export default TopicWall;
