import React from 'react';
import {styled} from '@material-ui/core/styles';
import {Badge, Container, IconButton, LinearProgress, MenuItem, Select, Tooltip, Typography} from "@material-ui/core";
import {Topic, User} from "../../types";

import {RouteComponentProps} from "react-router";
import {
    countTopicsInChannel,
    getTopicsByChannelAfterTimestamp,
    getTopicsByChannelPriorToTimestamp,
    getTopicsByChannelSortedByPopularityAfterTimestamp
} from '../../blockchain/TopicService';
import TopicOverviewCard from '../topic/TopicOverviewCard';
import LoadMoreButton from '../buttons/LoadMoreButton';
import {getUser} from '../../util/user-util';
import {
    countChannelFollowers,
    followChannel,
    getFollowedChannels,
    unfollowChannel
} from '../../blockchain/ChannelService';
import ChromiaPageHeader from '../common/ChromiaPageHeader';
import {getRepresentatives} from '../../blockchain/RepresentativesService';
import NewTopicButton from '../buttons/NewTopicButton';
import {Favorite, FavoriteBorder} from '@material-ui/icons';
import {getMutedUsers} from "../../blockchain/UserService";
import {TOPIC_VIEW_SELECTOR_OPTION} from "./WallCommon";

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
    countOfTopics: number;
    countOfFollowers: number;
    selector: TOPIC_VIEW_SELECTOR_OPTION;
    popularSelector: TOPIC_VIEW_SELECTOR_OPTION;
    mutedUsers: string[];
}

const StyledSelect = styled(Select)({
    float: "left",
    marginRight: "10px"
});

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
            channelFollowed: false,
            countOfTopics: 0,
            countOfFollowers: 0,
            selector: TOPIC_VIEW_SELECTOR_OPTION.RECENT,
            popularSelector: TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK,
            mutedUsers: []
        };

        this.retrieveTopics = this.retrieveTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
        this.retrievePopularTopics = this.retrievePopularTopics.bind(this);
        this.handleSelectorChange = this.handleSelectorChange.bind(this);
        this.handlePopularChange = this.handlePopularChange.bind(this);
    }

    componentDidMount(): void {
        this.retrieveTopics();
        getRepresentatives().then(representatives => this.setState({representatives: representatives}));

        const channel = this.props.match.params.channel;
        const user: User = getUser();
        if (user != null) {
            getFollowedChannels(user.name).then(channels => this.setState({channelFollowed: channels.includes(channel.toLocaleLowerCase())}));
            getMutedUsers(user).then(users => this.setState({mutedUsers: users}));
        }

        countChannelFollowers(channel).then(count => this.setState({countOfFollowers: count}));
        countTopicsInChannel(channel).then(count => this.setState({countOfTopics: count}));
    }

    retrieveTopics() {
        this.setState({isLoading: true});
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
        this.setState({isLoading: true});
        const channel = this.props.match.params.channel;

        const timestamp: number = this.state.topics.length > 0
            ? this.state.topics[this.state.topics.length - 1].timestamp
            : Date.now();

        if (channel != null) {
            getTopicsByChannelAfterTimestamp(channel, timestamp)
                .then(retrievedTopics => {
                    this.setState(prevState => ({
                        topics: retrievedTopics.concat(prevState.topics),
                        countOfFollowers: prevState.countOfFollowers + retrievedTopics.length,
                        isLoading: false
                    }));
                });
        }
    }

    toggleChannelFollow() {
        if (!this.state.isLoading) {
            const channel = this.props.match.params.channel;
            this.setState({isLoading: true});
            if (this.state.channelFollowed) {
                unfollowChannel(getUser(), channel)
                    .then(() => this.setState(prevState => ({
                        channelFollowed: false,
                        countOfFollowers: prevState.countOfFollowers - 1,
                        isLoading: false
                    })))
                    .catch(() => this.setState({isLoading: false}));
            } else {
                followChannel(getUser(), channel)
                    .then(() => this.setState(prevState => ({
                        channelFollowed: true,
                        countOfFollowers: prevState.countOfFollowers + 1,
                        isLoading: false
                    })))
                    .catch(() => this.setState({isLoading: false}));
            }
        }
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({isLoading: true});
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
                        this.setState({isLoading: false, couldExistOlderTopics: false});
                    }
                });
        }
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderTopics) {
            return (<LoadMoreButton onClick={this.retrieveOlderTopics}/>)
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
        }

        getTopicsByChannelSortedByPopularityAfterTimestamp(this.props.match.params.channel, timestamp, topicsPageSize)
            .then(topics => this.setState({topics: topics, couldExistOlderTopics: false, isLoading: false}))
            .catch(() => this.setState({isLoading: false}));
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
                <Container>
                    <div style={{textAlign: "center"}}>
                        <ChromiaPageHeader text={"#" + this.props.match.params.channel}/>
                        <Typography component="span" variant="subtitle1" className="pink-typography"
                                    style={{display: "inline"}}>Topics: {this.state.countOfTopics}</Typography>
                    </div>

                    <IconButton onClick={() => this.toggleChannelFollow()}>
                        <Badge badgeContent={this.state.countOfFollowers} color="primary">
                            <Tooltip title={this.state.channelFollowed ? "Unfollow channel" : "Follow channel"}>
                                {this.state.channelFollowed
                                    ? <Favorite className="red-color" fontSize="large"/>
                                    : <FavoriteBorder className="pink-color" fontSize="large"/>
                                }
                            </Tooltip>
                        </Badge>
                    </IconButton>

                    {this.state.isLoading ? <LinearProgress variant="query"/> : <div/>}
                    <StyledSelect
                        value={this.state.selector}
                        onChange={this.handleSelectorChange}
                    >
                        <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.RECENT}>Recent</MenuItem>
                        <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR}>Popular</MenuItem>
                    </StyledSelect>
                    {this.state.selector === TOPIC_VIEW_SELECTOR_OPTION.POPULAR
                        ? <StyledSelect value={this.state.popularSelector} onChange={this.handlePopularChange}>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_DAY}>Last day</MenuItem>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_WEEK}>Last week</MenuItem>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_MONTH}>Last month</MenuItem>
                            <MenuItem value={TOPIC_VIEW_SELECTOR_OPTION.POPULAR_ALL_TIME}>All time</MenuItem>
                        </StyledSelect>
                        : <div/>
                    }
                    <br/><br/>
                    {this.state.topics.map(topic => {
                        if (!this.state.mutedUsers.includes(topic.author)) {
                            return (<TopicOverviewCard
                                key={topic.id}
                                topic={topic}
                                isRepresentative={this.state.representatives.includes(topic.author)}
                            />);
                        } else {
                            return (<div/>);
                        }
                    })}
                    {this.renderLoadMoreButton()}
                    {getUser() != null
                        ? <NewTopicButton channel={this.props.match.params.channel}
                                          updateFunction={this.retrieveTopics}/>
                        : <div/>
                    }
                </Container>
            </div>
        );
    }

}
