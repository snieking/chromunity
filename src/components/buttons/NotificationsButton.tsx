import React, {useEffect, useState} from "react";

import {Badge} from "@material-ui/core";
import {Notifications, NotificationsActive} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {countUnreadUserNotifications} from "../../blockchain/NotificationService";
import {getUser} from "../../util/user-util";

export interface NotificationsButtonProps {
    username: string
}

const NotificationsButton: React.FunctionComponent<NotificationsButtonProps> = (props) => {

    const [counter, setCounter] = useState<number>(0);

    useEffect(() => {
        countUnreadUserNotifications(props.username).then(count => setCounter(count));
        // eslint-disable-next-line
    }, []);

    function render() {
        if (getUser() != null) {
            return (
                <IconButton aria-label="Notifications" onClick={() => setCounter(0)}>
                    <Badge className="star-badge" color="primary" badgeContent={counter}>
                        {counter > 0
                            ? <NotificationsActive className="nav-button"/>
                            : <Notifications className="nav-button"/>
                        }
                    </Badge>
                </IconButton>
            )
        } else {
            return <div/>
        }
    }

    return render();
};

export default NotificationsButton;
