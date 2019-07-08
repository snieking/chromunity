import React from 'react';
import '../Wall.css';
import { Container, Button } from "@material-ui/core";
import { getThreadsByTagPriorToTimestamp } from "../../../blockchain/MessageService";
import { Thread } from "../../../types";

import { RouteComponentProps } from "react-router";
import { ThreadCard } from "../../ThreadCard/ThreadCard";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

interface MatchParams {
    tag: string
}

export interface TagWallProps extends RouteComponentProps<MatchParams> {

}

export interface TagWallState {
    threads: Thread[];
    id: string;
    truncated: boolean;
    timestampOnOldestThread: number;
    existsOlder: boolean;
}

const chromiaTheme = createMuiTheme({ palette: { primary: { main: "#FFAFC1" } } })

export class TagWall extends React.Component<TagWallProps, TagWallState> {

    constructor(props: TagWallProps) {
        super(props);
        this.state = {
            threads: [],
            id: "",
            truncated: true,
            timestampOnOldestThread: Date.now(),
            existsOlder: true
        };

        this.retrieveThreads = this.retrieveThreads.bind(this);
        this.retrieveOlderThreads = this.retrieveOlderThreads.bind(this);
    }

    componentDidMount(): void {
        this.retrieveThreads();
    }

    retrieveThreads() {
        const tag = this.props.match.params.tag;
        if (tag != null) {
            getThreadsByTagPriorToTimestamp(tag, Date.now())
                .then(retrievedThreads => {
                    this.setState(prevState => ({ threads: retrievedThreads.concat(prevState.threads) }));
                });
        }
    }

    retrieveOlderThreads() {
        if (this.state.threads.length > 0) {
            const tag = this.props.match.params.tag;
            const oldestTimestamp: number = this.state.threads[this.state.threads.length - 1].timestamp;
            getThreadsByTagPriorToTimestamp(tag, oldestTimestamp)
                .then(retrievedThreads => {
                    if (retrievedThreads.length > 0) {
                        this.setState(prevState => ({
                            threads: prevState.threads.concat(retrievedThreads)
                        }));
                    } else {
                        this.setState({ existsOlder: false })
                    }
                });
        }
    }

    renderLoadMoreButton() {
        if (this.state.existsOlder && this.state.threads.length % 25 === 0) {
            return (
                <MuiThemeProvider theme={chromiaTheme}>
                    <Button type="submit" fullWidth color="primary"
                        onClick={() => this.retrieveOlderThreads()}
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
                        {this.state.threads.map(thread => <ThreadCard
                            key={"card-" + thread.id}
                            truncated={true}
                            isSubCard={false}
                            isUserPage={false}
                            thread={thread}
                        />)}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
            </div>
        );
    }

}
