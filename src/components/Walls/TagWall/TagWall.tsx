import React from 'react';
import '../Wall.css';
import { Container } from "@material-ui/core";
import { getThreadsByTag } from "../../../blockchain/MessageService";
import { Thread } from "../../../types";

import { RouteComponentProps } from "react-router";
import { ThreadCard } from "../../ThreadCard/ThreadCard";

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
}

export class TagWall extends React.Component<TagWallProps, TagWallState> {

    constructor(props: TagWallProps) {
        super(props);
        this.state = {
            threads: [],
            id: "",
            truncated: true,
            timestampOnOldestThread: Date.now()
        };

        this.retrieveThreads = this.retrieveThreads.bind(this);
    }

    componentDidMount(): void {
        this.retrieveThreads();
    }

    retrieveThreads() {
        const tag = this.props.match.params.tag;
        if (tag != null) {
            getThreadsByTag(tag).then(retrievedThreads => {
                this.setState({ threads: retrievedThreads });
            });
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
                </Container>
            </div>
        );
    }

}
