import React from 'react';
import {Container} from "@material-ui/core";

import {RouteComponentProps} from "react-router";
import {getUserNotifications, markNotificationsRead} from "../../blockchain/NotificationService";
import {UserNotification} from "../../types";
import {getUser} from "../../util/user-util";
import NotificationCard from './NotificationCard';
import ChromiaPageHeader from '../utils/ChromiaPageHeader';

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
                <ChromiaPageHeader text="User Notifications"/>
                {this.state.notifications.map(notification => <NotificationCard key={notification.id} notification={notification}/>)}
            </Container>
        );
    }

}
