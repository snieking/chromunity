import React from 'react';
import {styled} from '@material-ui/core/styles';
import {Topic, User} from '../../types';
import {
    getAllTopicsByPopularityAfterTimestamp,
    getTopicsAfterTimestamp,
    getTopicsByFollowedChannelSortedByPopularityAfterTimestamp,
    getTopicsByFollowsSortedByPopularityAfterTimestamp,
    getTopicsFromFollowedChannelsPriorToTimestamp,
    getTopicsFromFollowsAfterTimestamp,
    getTopicsFromFollowsPriorToTimestamp,
    getTopicsPriorToTimestamp
} from '../../blockchain/TopicService';
import {Container, LinearProgress, MenuItem, Select} from '@material-ui/core';
import TopicOverviewCard from '../topic/TopicOverviewCard';
import NewTopicButton from '../buttons/NewTopicButton';
import {getUser} from '../../util/user-util';
import LoadMoreButton from '../buttons/LoadMoreButton';
import {TrendingChannels} from '../tags/TrendingTags';
import ChromiaPageHeader from '../common/ChromiaPageHeader';
import {getRepresentatives} from '../../blockchain/RepresentativesService';
import {getMutedUsers} from "../../blockchain/UserService";
import {TOPIC_VIEW_SELECTOR_OPTION} from "./WallCommon";

interface Props {
    type: string;
}

interface State {
    topics: Topic[];
    representatives: string[];
    isLoading: boolean;
    couldExistOlderTopics: boolean;
    selector: TOPIC_VIEW_SELECTOR_OPTION;
    popularSelector: TOPIC_VIEW_SELECTOR_OPTION;
    mutedUsers: string[];
}

const StyledSelector = styled(Select)({
    color: "pink",
    float: "left",
    marginRight: "10px"
});

const topicsPageSize: number = 25;

class TopicWall extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            topics: [],
            representatives: [],
            isLoading: true,
            couldExistOlderTopics: false,
            selector: TOPIC_VIEW_SELECTOR_OPTION.RECENT,
            popularSelector: TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK,
            mutedUsers: []
        };

        this.retrieveLatestTopics = this.retrieveLatestTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
        this.handleSelectorChange = this.handleSelectorChange.bind(this);
        this.handlePopularChange = this.handlePopularChange.bind(this);
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderTopics) {
            return (<LoadMoreButton onClick={this.retrieveOlderTopics}/>)
        }
    }

    getHeader() {
        if (this.props.type === "userFollowings") {
            return "Followed Users";
        } else if (this.props.type === "tagFollowings") {
            return "Trending Channels";
        } else {
            return "Topics"
        }
    }

    handleSelectorChange(event: React.ChangeEvent<{ value: unknown }>) {
        const selected = event.target.value as TOPIC_VIEW_SELECTOR_OPTION;

        if (this.state.selector !== selected) {
            this.setState({selector: selected, topics: []});

            if (selected === TOPIC_VIEW_SELECTOR_OPTION.RECENT) {
                this.retrieveLatestTopics();
            } else if (selected === TOPIC_VIEW_SELECTOR_OPTION.POPULAR) {
                this.retrievePopularTopics(selected);
            }
        }
    }

    handlePopularChange(event: React.ChangeEvent<{ value: unknown }>) {
        const selected = event.target.value as TOPIC_VIEW_SELECTOR_OPTION;

        if (this.state.popularSelector !== selected) {
            this.setState({popularSelector: selected, topics: []});
            this.retrievePopularTopics(selected);
        }
    }

    render() {
        return (
            <div>
                <Container fixed>
                    <ChromiaPageHeader text={this.getHeader()}/>
                    {this.state.isLoading ? <LinearProgress variant="query"/> : <div/>}
                    {this.props.type === "tagFollowings" ? <TrendingChannels/> : <div/>}
                    {this.props.type === "tagFollowings" ? <ChromiaPageHeader text="Followed Channels"/> :
                        <div/>}
                    <StyledSelector
                        value={this.state.selector}
                        onChange={this.handleSelectorChange}
                    >
                        <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.RECENT}>Recent</MenuItem>
                        <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR}>Popular</MenuItem>
                    </StyledSelector>
                    {this.state.selector === TOPIC_VIEW_SELECTOR_OPTION.POPULAR
                        ? <StyledSelector value={this.state.popularSelector} onChange={this.handlePopularChange}>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_DAY}>Last day</MenuItem>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK}>Last week</MenuItem>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_MONTH}>Last month</MenuItem>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_ALL_TIME}>All time</MenuItem>
                        </StyledSelector>
                        : <div/>
                    }
                    <br/><br/>
                    {this.state.topics.map(topic => {
                        if (!this.state.mutedUsers.includes(topic.author)) {
                            return (<TopicOverviewCard
                                key={'card-' + topic.id}
                                topic={topic}
                                isRepresentative={this.state.representatives.includes(topic.author)}
                            />);
                        } else {
                            return (<div/>);
                        }
                    })}
                    {this.renderLoadMoreButton()}
                </Container>
                {getUser() != null
                    ? <NewTopicButton channel="" updateFunction={this.retrieveLatestTopics}/>
                    : <div/>
                }
            </div>
        );
    }

    componentDidMount() {
        const user: User = getUser();
        if (user != null) {
            getMutedUsers(user).then(users => this.setState({mutedUsers: users}));
        }
        this.retrieveLatestTopics();
        getRepresentatives().then(representatives => this.setState({representatives: representatives}));
    }

    retrieveLatestTopicsForAll() {
        let topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsPriorToTimestamp(Date.now(), topicsPageSize);
        } else {
            topics = getTopicsAfterTimestamp(this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => this.appendLatestTopics(retrievedTopics))
            .catch(() => this.setState({isLoading: false, couldExistOlderTopics: false}));
    }

    retrieveLatestTopicsForUserFollowings() {
        let topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsFromFollowsPriorToTimestamp(getUser(), Date.now(), topicsPageSize);
        } else {
            topics = getTopicsFromFollowsAfterTimestamp(getUser(), this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => this.appendLatestTopics(retrievedTopics))
            .catch(() => this.setState({isLoading: false, couldExistOlderTopics: false}));
    }

    retrieveLatestTopicsForTagFollowings() {
        let topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            topics = getTopicsFromFollowedChannelsPriorToTimestamp(getUser(), Date.now(), topicsPageSize);
        } else {
            topics = getTopicsFromFollowedChannelsPriorToTimestamp(getUser(), this.state.topics[0].timestamp, topicsPageSize);
        }

        topics.then(retrievedTopics => this.appendLatestTopics(retrievedTopics))
            .catch(() => this.setState({isLoading: false, couldExistOlderTopics: false}));
    }

    appendLatestTopics(topics: Topic[]) {
        if (topics.length > 0) {
            this.setState(prevState => ({
                topics: Array.from(new Set(topics.concat(prevState.topics))),
                isLoading: false,
                couldExistOlderTopics: topics.length >= topicsPageSize
            }));
        } else {
            this.setState({isLoading: false, couldExistOlderTopics: false});
        }
    }

    retrieveLatestTopics() {
        this.setState({isLoading: true});

        if (this.props.type === "userFollowings") {
            this.retrieveLatestTopicsForUserFollowings();
        } else if (this.props.type === "tagFollowings") {
            this.retrieveLatestTopicsForTagFollowings();
        } else {
            this.retrieveLatestTopicsForAll();
        }
    }

    retrievePopularTopics(selected: TOPIC_VIEW_SELECTOR_OPTION) {
        this.setState({isLoading: true});

        const dayInMilliSeconds: number = 86400000;
        let timestamp: number;

        switch (selected) {
            case TOPIC_VIEW_SELECTOR_OPTION.POPULAR_DAY:
                timestamp = Date.now() - dayInMilliSeconds;
                break;
            case TOPIC_VIEW_SELECTOR_OPTION.POPULAR:
            case TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK:
                timestamp = Date.now() - (dayInMilliSeconds * 7);
                break;
            case TOPIC_VIEW_SELECTOR_OPTION.POPULAR_MONTH:
                timestamp = Date.now() - (dayInMilliSeconds * 30);
                break;
            default:
                timestamp = 0;
                break;
        }

        let topics: Promise<Topic[]>;
        if (this.props.type === "userFollowings") {
            topics = getTopicsByFollowsSortedByPopularityAfterTimestamp(getUser().name, timestamp, topicsPageSize);
        } else if (this.props.type === "tagFollowings") {
            topics = getTopicsByFollowedChannelSortedByPopularityAfterTimestamp(getUser().name, timestamp, topicsPageSize);
        } else {
            topics = getAllTopicsByPopularityAfterTimestamp(timestamp, topicsPageSize)
        }

        topics.then(topics => this.setState({topics: topics, couldExistOlderTopics: false, isLoading: false}))
            .catch(() => this.setState({isLoading: false}));
    }

    retrieveOlderTopicsForUserFollowings(oldestTimestamp: number) {
        getTopicsFromFollowsPriorToTimestamp(getUser(), oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => this.appendOlderTopics(retrievedTopics))
            .catch(() => this.setState({isLoading: false, couldExistOlderTopics: false}));
    }

    retrieveOlderTopicsForTagFollowings(oldestTimestamp: number) {
        getTopicsFromFollowedChannelsPriorToTimestamp(getUser(), oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => this.appendOlderTopics(retrievedTopics))
            .catch(() => this.setState({isLoading: false, couldExistOlderTopics: false}));
    }

    retrieveOlderTopicsForAll(oldestTimestamp: number) {
        getTopicsPriorToTimestamp(oldestTimestamp, topicsPageSize)
            .then(retrievedTopics => this.appendOlderTopics(retrievedTopics))
            .catch(() => this.setState({isLoading: false, couldExistOlderTopics: false}));
    }

    appendOlderTopics(topics: Topic[]) {
        if (topics.length > 0) {
            this.setState(prevState => ({
                topics: Array.from(new Set(prevState.topics.concat(topics))),
                isLoading: false,
                couldExistOlderTopics: topics.length >= topicsPageSize
            }));
        } else {
            this.setState({isLoading: false, couldExistOlderTopics: false});
        }
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({isLoading: true});
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
