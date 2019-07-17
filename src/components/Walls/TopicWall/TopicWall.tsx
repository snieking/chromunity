import React from 'react';
import { Topic } from '../../../types';
import { getTopicsPriorToTimestamp, getTopicsAfterTimestamp } from '../../../blockchain/TopicService';
import { LinearProgress, Container, FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import { NewTopicButton } from '../../buttons/NewTopicButton';
import { getUser } from '../../../util/user-util';

interface State {
    topics: Topic[];
    displayFollowersOnlySwitch: boolean;
    followersOnly: boolean;
    isLoading: boolean;
}

class TopicWall extends React.Component<{}, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            topics: [],
            displayFollowersOnlySwitch: false,
            followersOnly: false,
            isLoading: true
        };

        this.retrieveLatestTopics = this.retrieveLatestTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    }

    render() {
        return (
            <div>
                <Container fixed maxWidth='md'>
                    <div className='topic-wall-container'>
                        <br />
                        {this.renderFollowersOnlySwitch()}
                        {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                        {this.state.topics.map(topic => <TopicOverviewCard key={'card-' + topic.id} topic={topic} />)}
                    </div>
                </Container>
                {getUser() != null ? <NewTopicButton updateFunction={this.retrieveLatestTopics}/> : <div></div>}
            </div>
        );
    }

    componentDidMount() {
        this.retrieveLatestTopics();
    }

    renderFollowersOnlySwitch() {
        if (this.state.displayFollowersOnlySwitch) {
            return (
                <FormGroup row>
                    <FormControlLabel className="switch-label"
                        control={
                            <Switch checked={this.state.followersOnly}
                                onChange={() => this.toggleFollowersOnly()}
                                value={this.state.followersOnly}
                                className="switch" />
                        }
                        label="Followers only"
                    />
                </FormGroup>
            )
        }
    }

    toggleFollowersOnly() {
        this.setState(prevState => (
            { followersOnly: !prevState.followersOnly, topics: [] }),
            () => this.retrieveLatestTopics()
        );
    }

    retrieveLatestTopics() {
        this.setState({ isLoading: true });
        var topics: Promise<Topic[]>;

        if (this.state.topics.length === 0) {
            if (this.state.followersOnly) {
                // TODO
            } else {
                topics = getTopicsPriorToTimestamp(Date.now());
            }
        } else {
            if (this.state.followersOnly) {
                // TODO
            } else {
                topics = getTopicsAfterTimestamp(this.state.topics[0].timestamp);
            }
        }

        topics.then(retrievedTopics => {
            if (retrievedTopics.length > 0) {
                this.setState(prevState => ({
                    topics: Array.from(new Set(retrievedTopics.concat(prevState.topics))),
                    isLoading: false
                }));
            }
        })
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({ isLoading: true });
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;

            var threads: Promise<Topic[]>;
            if (this.state.followersOnly) {
                // TODO
            } else {
                threads = getTopicsPriorToTimestamp(oldestTimestamp);
            }

            threads.then(retrievedTopics => {
                if (retrievedTopics.length > 0) {
                    this.setState(prevState => ({
                        topics: Array.from(new Set(prevState.topics.concat(retrievedTopics))),
                        isLoading: false
                    }));
                }
            });
        }
    }
}

export default TopicWall;
