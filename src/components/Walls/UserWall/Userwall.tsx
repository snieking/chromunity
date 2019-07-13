import React from 'react';
import '../Wall.css';
import { Container, Button } from "@material-ui/core";
import { getThreadsByUserIdPriorToTimestamp } from "../../../blockchain/MessageService";
import { Thread } from "../../../types";

import { RouteComponentProps } from "react-router";
import { ThreadCard } from "../../ThreadCard/ThreadCard";
import { ProfileCard } from "../../user/Profile/ProfileCard";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { chromiaTheme } from '../Wall';

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

const theme = chromiaTheme();
const threadsPageLimit: number = 25;

export class UserWall extends React.Component<UserWallProps, UserWallState> {

    constructor(props: UserWallProps) {
        super(props);
        this.state = {
            threads: [],
            id: "",
            truncated: true,
            timestampOnOldestThread: Date.now(),
        };

        this.retrieveThreads = this.retrieveThreads.bind(this);
        this.retrieveOlderThreads = this.retrieveOlderThreads.bind(this);
        this.renderUserPageIntro = this.renderUserPageIntro.bind(this);
    }

    componentDidMount(): void {
        this.retrieveThreads();
    }

    retrieveThreads() {
        const userId = this.props.match.params.userId;
        if (userId != null) {
            getThreadsByUserIdPriorToTimestamp(userId, Date.now())
                .then(retrievedThreads => {
                    this.setState(prevState => ({ threads: retrievedThreads.concat(prevState.threads) }));
                });
        }
    }

    retrieveOlderThreads() {
        if (this.state.threads.length > 0) {
            const userId = this.props.match.params.userId;
            const oldestTimestamp: number = this.state.threads[this.state.threads.length - 1].timestamp;
            getThreadsByUserIdPriorToTimestamp(userId, oldestTimestamp)
                .then(retrievedThreads => {
                    if (retrievedThreads.length > 0) {
                        this.setState(prevState => ({
                            threads: prevState.threads.concat(retrievedThreads)
                        }));
                    }
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

    renderLoadMoreButton() {
        if (this.state.threads.length >= threadsPageLimit && 
            this.state.threads.length % threadsPageLimit === 0) {
            return (
                <MuiThemeProvider theme={theme}>
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
                        {this.renderUserPageIntro()}
                        {this.state.threads.map(thread => <ThreadCard
                            key={"card-" + thread.id}
                            truncated={true}
                            isSubCard={false}
                            isUserPage={true}
                            thread={thread}
                        />)}
                    </div>
                    {this.renderLoadMoreButton()}
                </Container>
            </div>
        );
    }

}
