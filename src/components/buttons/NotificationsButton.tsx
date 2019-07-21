import React from "react";

import {Badge} from "@material-ui/core";
import {NotificationsActive, Notifications} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {countUnreadUserNotifications} from "../../blockchain/NotificationService";
import {getUser} from "../../util/user-util";

export interface NotificationsButtonProps {
    username: string
}

export interface NotificationsButtonState {
    counter: number;
}

export class NotificationsButton extends React.Component<NotificationsButtonProps, NotificationsButtonState> {

    constructor(props: NotificationsButtonProps) {
        super(props);
        this.state = { counter: 0 };
    }

    componentDidMount(): void {
        countUnreadUserNotifications(this.props.username).then(count => this.setState({counter: count}));
    }

    render() {
        if (getUser().name != null) {
            return (
                <IconButton aria-label="Notifications" onClick={() => this.setState({counter: 0})}>
                    <Badge className="star-badge" color="primary" badgeContent={this.state.counter}>
                        {this.state.counter > 0 ? <NotificationsActive className="nav-button"/> : <Notifications className="nav-button"/>}
                    </Badge>
                </IconButton>
            )
        }
    }

}
