import React from 'react';
import '../Wall.css';
import { Container, Button, LinearProgress } from "@material-ui/core";
import { Topic } from "../../../types";

import { RouteComponentProps } from "react-router";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { chromiaTheme } from '../Wall';
import { getTopicsByTagPriorToTimestamp } from '../../../blockchain/TopicService';
import TopicOverviewCard from '../../Topic/TopicOverViewCard/TopicOverviewCard';

interface MatchParams {
    tag: string
}

export interface TagWallProps extends RouteComponentProps<MatchParams> {

}

export interface TagWallState {
    topics: Topic[];
    id: string;
    timestampOnOldestTopic: number;
    isLoading: boolean;
}

const theme = chromiaTheme();
const topicsPageLimit: number = 25;

export class TagWall extends React.Component<TagWallProps, TagWallState> {

    constructor(props: TagWallProps) {
        super(props);
        this.state = {
            topics: [],
            id: "",
            timestampOnOldestTopic: Date.now(),
            isLoading: true
        };

        this.retrieveTopics = this.retrieveTopics.bind(this);
        this.retrieveOlderTopics = this.retrieveOlderTopics.bind(this);
    }

    componentDidMount(): void {
        this.retrieveTopics();
    }

    retrieveTopics() {
        this.setState({ isLoading: true });
        const tag = this.props.match.params.tag;
        if (tag != null) {
            getTopicsByTagPriorToTimestamp(tag, Date.now())
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
            const tag = this.props.match.params.tag;
            const oldestTimestamp: number = this.state.topics[this.state.topics.length - 1].timestamp;
            getTopicsByTagPriorToTimestamp(tag, oldestTimestamp)
                .then(retrievedTopics => {
                    if (retrievedTopics.length > 0) {
                        this.setState(prevState => ({
                            topics: prevState.topics.concat(retrievedTopics),
                            isLoading: false
                        }));
                    } else {
                        this.setState({ isLoading: false });
                    }
                });
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
                        {this.state.topics.map(topic => <TopicOverviewCard topic={topic} />)}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
            </div>
        );
    }

}
