import React from 'react';
import { Container, LinearProgress } from "@material-ui/core";

import { RouteComponentProps } from "react-router";
import { getUserNotificationsPriorToTimestamp, markNotificationsRead } from "../../blockchain/NotificationService";
import { UserNotification } from "../../types";
import { getUser } from "../../util/user-util";
import NotificationCard from './NotificationCard';
import ChromiaPageHeader from '../utils/ChromiaPageHeader';
import LoadMoreButton from "../buttons/LoadMoreButton";

interface MatchParams {
    userId: string
}

export interface UserNotificationsProps extends RouteComponentProps<MatchParams> {

}

export interface UserNotificationsState {
    notifications: UserNotification[];
    isLoading: boolean;
    couldExistOlderNotifications: boolean;
}

const notificationsPageSize: number = 25;

export class UserNotifications extends React.Component<UserNotificationsProps, UserNotificationsState> {

    constructor(props: UserNotificationsProps) {
        super(props);
        this.state = {
            notifications: [],
            isLoading: true,
            couldExistOlderNotifications: false
        };

        this.retrieveNotifications = this.retrieveNotifications.bind(this);
    }

    componentDidMount(): void {
        this.retrieveNotifications();
    }

    render() {
        return (
            <Container fixed maxWidth="md">
                <ChromiaPageHeader text="User Notifications" />
                {this.state.isLoading ? <LinearProgress variant="query" /> : <div></div>}
                {this.state.notifications.map(notification => <NotificationCard key={notification.id} notification={notification} />)}
                {this.renderLoadMoreButton()}
            </Container>
        );
    }

    retrieveNotifications() {
        const userId = this.props.match.params.userId;
        const loggedInUser = getUser();

        this.setState({ isLoading: true });
        const timestamp: number = this.state.notifications.length !== 0
            ? this.state.notifications[this.state.notifications.length - 1].timestamp
            : Date.now();

        getUserNotificationsPriorToTimestamp(userId, timestamp, notificationsPageSize)
            .then(notifications => {
                this.setState(prevState => ({
                    notifications: Array.from(new Set(prevState.notifications.concat(notifications))),
                    isLoading: false,
                    couldExistOlderNotifications: notifications.length >= notificationsPageSize
                }));

                if (loggedInUser != null && loggedInUser.name === userId) {
                    markNotificationsRead(getUser());
                }
            })
    }

    renderLoadMoreButton() {
        if (this.state.couldExistOlderNotifications) {
            return (<LoadMoreButton onClick={this.retrieveNotifications} />)
        }
    }

}
