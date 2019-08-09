import React from 'react';
import {Link} from "react-router-dom";
import {
    Chip,
    Container,
    createStyles,
    LinearProgress,
    Paper,
    Tab,
    Tabs,
    withStyles,
    WithStyles
} from "@material-ui/core";
import {Topic, TopicReply} from "../../types";

import {RouteComponentProps} from "react-router";
import ProfileCard from "../user/ProfileCard";
import {getTopicRepliesByUserPriorToTimestamp, getTopicsByUserPriorToTimestamp} from '../../blockchain/TopicService';
import TopicOverviewCard from '../Topic/TopicOverViewCard/TopicOverviewCard';
import LoadMoreButton from '../buttons/LoadMoreButton';
import {getRepresentatives} from '../../blockchain/RepresentativesService';
import TopicReplyOverviewCard from '../Topic/TopicReplyOverviewCard/TopicReplyOverviewCard';
import {stringToHexColor} from '../../util/util';
import {getFollowedChannels} from '../../blockchain/ChannelService';
import {COLOR_SOFT_PINK} from "../../theme";

const styles = createStyles({
    softPink: {
        color: COLOR_SOFT_PINK
    }
});

interface MatchParams {
    userId: string;
}

export interface UserWallProps extends RouteComponentProps<MatchParams>, WithStyles<typeof styles> {

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
    followedChannels: string[];
}

const topicsPageSize: number = 25;

const UserWall = withStyles(styles)(
    class extends React.Component<UserWallProps, UserWallState> {

        constructor(props: UserWallProps) {
            super(props);
            this.state = {
                topics: [],
                topicReplies: [],
                representatives: [],
                followedChannels: [],
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
            getRepresentatives().then(representatives => this.setState({representatives: representatives}));
            getFollowedChannels(this.props.match.params.userId).then(channels => this.setState({followedChannels: channels}));
        }

        retrieveTopics() {
            this.setState({isLoading: true});
            const userId = this.props.match.params.userId;
            if (userId != null) {
                getTopicsByUserPriorToTimestamp(userId, Date.now(), topicsPageSize)
                    .then(retrievedTopics => {
                        this.setState(prevState => ({
                            topics: retrievedTopics.concat(prevState.topics),
                            isLoading: false,
                            couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                        }));
                    }).catch(() => this.setState({isLoading: false}));
            }
        }

        retrieveTopicReplies() {
            this.setState({isLoading: true});
            const userId = this.props.match.params.userId;

            const timestamp: number = this.state.topicReplies.length > 0
                ? this.state.topicReplies[this.state.topicReplies.length - 1].timestamp
                : Date.now();

            if (userId != null) {
                getTopicRepliesByUserPriorToTimestamp(userId, timestamp, topicsPageSize)
                    .then(retrievedReplies => {
                        this.setState(prevState => ({
                            topicReplies: retrievedReplies.concat(prevState.topicReplies),
                            isLoading: false,
                            couldExistOlderTopicReplies: retrievedReplies.length >= topicsPageSize
                        }));
                    }).catch(() => this.setState({isLoading: false}));
            }
        }

        retrieveOlderTopics() {
            if (this.state.topics.length > 0) {
                this.setState({isLoading: true});
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
                            this.setState({isLoading: false, couldExistOlderTopics: false});
                        }
                    });
            }
        }

        renderUserPageIntro() {
            if (this.props.match.params.userId != null) {
                return (
                    <ProfileCard username={this.props.match.params.userId}/>
                )
            }
        }

        renderLoadMoreButton() {
            if (this.state.couldExistOlderTopics) {
                return (<LoadMoreButton onClick={this.retrieveOlderTopics}/>)
            }
        }

        a11yProps(index: number) {
            return {
                id: `simple-tab-${index}`,
                'aria-controls': `simple-tabpanel-${index}`,
            };
        }

        handleChange(event: React.ChangeEvent<{}>, newValue: number) {
            this.setState({activeTab: newValue});
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
            } else if (this.state.activeTab === 2 && this.state.followedChannels.length > 0) {
                return (
                    <Paper>
                        <div style={{padding: "15px"}}>
                            {this.state.followedChannels.map(channel => {
                                return (
                                    <Link key={channel} to={"/c/" + channel.replace("#", "")}>
                                        <Chip
                                            size="small"
                                            label={"#" + channel}
                                            style={{
                                                marginLeft: "1px",
                                                marginRight: "1px",
                                                marginBottom: "3px",
                                                backgroundColor: stringToHexColor(channel),
                                                cursor: "pointer"
                                            }}
                                        />
                                    </Link>
                                )
                            })}
                        </div>
                    </Paper>
                )
            } else {
                return (<div/>)
            }
        }

        render() {
            return (
                <div>
                    <Container fixed>
                        {this.state.isLoading ? <LinearProgress variant="query"/> : <div/>}
                        {this.renderUserPageIntro()}
                        <Tabs value={this.state.activeTab} onChange={this.handleChange} aria-label="User activity">
                            <Tab label="Topics" {...this.a11yProps(0)} className={this.props.classes.softPink}/>
                            <Tab label="Replies" {...this.a11yProps(1)} className={this.props.classes.softPink}/>
                            <Tab label="Channels" {...this.a11yProps(2)} className={this.props.classes.softPink}/>
                        </Tabs>
                        {this.renderUserContent()}
                        {this.renderLoadMoreButton()}
                    </Container>
                </div>
            );
        }

    }
);

export default UserWall;
