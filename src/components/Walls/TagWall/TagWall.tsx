import React from 'react';
import '../Wall.css';
import { Container, LinearProgress, FormGroup, FormControlLabel, Switch } from "@material-ui/core";
import { Topic } from "../../../types";

import { RouteComponentProps } from "react-router";
import { getTopicsByTagPriorToTimestamp } from '../../../blockchain/TopicService';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';
import LoadMoreButton from '../../buttons/LoadMoreButton';
import { getUser } from '../../../util/user-util';
import { unfollowTag, followTag, getFollowedTags } from '../../../blockchain/TagService';
import ChromiaPageHeader from '../../utils/ChromiaPageHeader';
import { getRepresentatives } from '../../../blockchain/RepresentativesService';

interface MatchParams {
    tag: string
}

export interface TagWallProps extends RouteComponentProps<MatchParams> {

}

export interface TagWallState {
    topics: Topic[];
    representatives: string[];
    id: string;
    timestampOnOldestTopic: number;
    isLoading: boolean;
    couldExistOlderTopics: boolean;
    tagFollowed: boolean;
}

const topicsPageSize: number = 25;

export class TagWall extends React.Component<TagWallProps, TagWallState> {

    constructor(props: TagWallProps) {
        super(props);
        this.state = {
            topics: [],
            representatives: [],
            id: "",
            timestampOnOldestTopic: Date.now(),
            isLoading: true,
            couldExistOlderTopics: false,
            tagFollowed: false
        };

        this.retrieveTopics = this.retrieveTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    }

    componentDidMount(): void {
        this.retrieveTopics();
        getRepresentatives().then(representatives => this.setState({ representatives: representatives }));

        if (getUser().name != null) {
            const tag = this.props.match.params.tag;
            getFollowedTags(getUser()).then(tags => this.setState({ tagFollowed: tags.includes(tag) }));
        }
    }

    retrieveTopics() {
        this.setState({ isLoading: true });
        const tag = this.props.match.params.tag;
        if (tag != null) {
            getTopicsByTagPriorToTimestamp(tag, Date.now(), topicsPageSize)
                .then(retrievedTopics => {
                    this.setState(prevState => ({
                        topics: retrievedTopics.concat(prevState.topics),
                        isLoading: false,
                        couldExistOlderTopics: retrievedTopics.length >= topicsPageSize
                    }));
                });
        }
    }

    toggleTagFollow() {
        const tag = this.props.match.params.tag;
        if (this.state.tagFollowed) {
            unfollowTag(getUser(), tag).then(() => this.setState({ tagFollowed: false }));
        } else {
            followTag(getUser(), tag).then(() => this.setState({ tagFollowed: true }));
        }
    }

    renderFollowSwitch() {
        if (getUser().name != null) {
            return (
                <FormGroup row>
                    <FormControlLabel className="switch-label"
                        control={
                            <Switch checked={this.state.tagFollowed}
                                onChange={() => this.toggleTagFollow()}
                                value={this.state.tagFollowed}
                                className="switch" />
                        }
                        label="Follow tag"
                    />
                </FormGroup>
            )
        }
    }

    retrieveOlderTopics() {
        if (this.state.topics.length > 0) {
            this.setState({ isLoading: true });
            const tag = this.props.match.params.tag;
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;
            getTopicsByTagPriorToTimestamp(tag, oldestTimestamp, topicsPageSize)
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
                        <ChromiaPageHeader text={"#" + this.props.match.params.tag} />
                        {this.renderFollowSwitch()}
                        {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                        {this.state.topics.map(topic => <TopicOverviewCard
                            key={topic.id}
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
