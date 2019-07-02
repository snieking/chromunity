import React from 'react';
import Header from '../Header/Header'
import {Container} from "@material-ui/core";

import {RouteComponentProps} from "react-router";
import {getUserNotifications, markNotificationsRead} from "../../blockchain/NotificationService";
import {ThreadCard} from "../ThreadCard/ThreadCard";
import {Thread, UserNotification} from "../../types";
import {getUser} from "../../util/user-util";

interface MatchParams {
    userId: string
}

export interface UserNotificationsProps extends RouteComponentProps<MatchParams> {

}

export interface UserNotificationsState {
    notifications: UserNotification[]
}

export class UserNotifications extends React.Component<UserNotificationsProps, UserNotificationsState> {

    constructor(props: UserNotificationsProps) {
        super(props);
        this.state = {
            notifications: []
        };
    }

    componentDidMount(): void {
        const userId = this.props.match.params.userId;
        getUserNotifications(userId).then(notifications => {
            console.log("Retrieved notifications: ", notifications);
            this.setState({notifications: notifications});
        });

        const loggedInUser = getUser();
        if (loggedInUser != null && loggedInUser.name === userId) {
            markNotificationsRead(getUser());
        }
    }

    render() {
        return (
            <div>
                <Header/>
                <Container fixed maxWidth="md">
                    <br/>
                    {this.state.notifications.map(notification => {
                        const thread: Thread = {
                            id: notification.threadId,
                            rootThreadId: notification.rootThreadId,
                            author: notification.author,
                            message: notification.message,
                            timestamp: notification.timestamp
                        };
                        return (<ThreadCard key={"noti-" + thread.id} truncated={true} isSubCard={false} thread={thread}/>);
                    })}
                </Container>
            </div>
        );
    }

}
