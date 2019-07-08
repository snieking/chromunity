import React from 'react';
import '../Wall.css';
import { Container } from "@material-ui/core";
import { getThreadsByUserId } from "../../../blockchain/MessageService";
import { Thread } from "../../../types";

import { RouteComponentProps } from "react-router";
import { ThreadCard } from "../../ThreadCard/ThreadCard";
import { ProfileCard } from "../../user/Profile/ProfileCard";

interface MatchParams {
    userId: string
}

export interface UserWallProps extends RouteComponentProps<MatchParams> {

}

export interface UserWallState {
    threads: Thread[];
    id: string;
    truncated: boolean;
    timestampOnOldestThread: number;
}

export class UserWall extends React.Component<UserWallProps, UserWallState> {

    constructor(props: UserWallProps) {
        super(props);
        this.state = {
            threads: [],
            id: "",
            truncated: true,
            timestampOnOldestThread: Date.now()
        };

        this.retrieveThreads = this.retrieveThreads.bind(this);
        this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
    }

    componentDidMount(): void {
        this.retrieveThreads();
    }

    retrieveThreads() {
        const userId = this.props.match.params.userId;
        if (userId != null) {
            getThreadsByUserId(userId).then(retrievedThreads => {
                this.setState({ threads: retrievedThreads });
            });
        }
    }

    renderUserPageIntro() {
        if (this.props.match.params.userId != null) {
            return (
                <ProfileCard username={this.props.match.params.userId} />
            )
        }
    }

    render() {
        return (
            <div>
                <Container fixed maxWidth="md">
                    <div className="thread-wall-container">
                        <br />
                        {this.renderUserPageIntro()}
                        {this.state.threads.map(thread => <ThreadCard
                            key={"card-" + thread.id}
                            truncated={true}
                            isSubCard={false}
                            isUserPage={true}
                            thread={thread}
                        />)}
                    </div>
                </Container>
            </div>
        );
    }

}
