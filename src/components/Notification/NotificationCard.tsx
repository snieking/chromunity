import React from 'react';

import {Card, CardContent, Typography} from "@material-ui/core";
import {UserNotification} from "../../types";
import {parseContent} from '../../util/text-parsing';
import {timeAgoReadable} from '../../util/util';

import './NotificationCard.css';

export interface NotificationCardProps {
    notification: UserNotification;
}


const NotificationCard: React.FunctionComponent<NotificationCardProps> = (props) => {

    function renderTimeAgo() {
        return (
            <Typography className="timestamp right" variant="body2" component="span">
                {timeAgoReadable(props.notification.timestamp)}
            </Typography>
        )
    }

    function renderTrigger() {
        if (props.notification.trigger !== "") {
            return (
                <Typography
                    gutterBottom
                    variant="h6"
                    component="h6"
                    className="purple-typography"
                >
                    <span dangerouslySetInnerHTML={{
                        __html: parseContent(props.notification.trigger)
                    }}/>
                </Typography>
            );
        }
    }

    function renderContent() {
        if (props.notification.content !== "") {
            return (
                <Typography
                    gutterBottom
                    variant="body2"
                    component="p"
                    className="purple-typography"
                >
                    <span dangerouslySetInnerHTML={{
                        __html: parseContent(props.notification.content)
                    }}/>
                </Typography>
            );
        }
    }

    return (
        <Card raised={!props.notification.read} className="notification">
            <CardContent>
                {renderTimeAgo()}
                {renderTrigger()}
                {renderContent()}
            </CardContent>
        </Card>
    );
}

export default NotificationCard;