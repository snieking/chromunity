import React from 'react';
import {Container} from "@material-ui/core";

import {RouteComponentProps} from "react-router";
import {getUserNotifications, markNotificationsRead} from "../../blockchain/NotificationService";
import {Topic, UserNotification} from "../../types";
import {getUser} from "../../util/user-util";
import TopicOverviewCard from '../Topic/TopicOverViewCard/TopicOverviewCard';

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
        getUserNotifications(userId).then(notifications => this.setState({notifications: notifications}));

        const loggedInUser = getUser();
        if (loggedInUser != null && loggedInUser.name === userId) {
            markNotificationsRead(getUser());
        }
    }

    render() {
        return (
            <Container fixed maxWidth="md">
                <br/>
                {this.state.notifications.map(notification => {
                    const topic: Topic = {
                        id: notification.topicId,
                        title: notification.title,
                        author: notification.author,
                        message: notification.message,
                        timestamp: notification.timestamp
                    };
                    return (<TopicOverviewCard key={"noti-" + topic.id} topic={topic}/>);
                })}
            </Container>
        );
    }

}
