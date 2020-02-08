import React from "react";

import { Card, CardContent, createStyles, makeStyles, Typography } from "@material-ui/core";
import { UserNotification } from "../../../types";
import { parseContent } from "../../../util/text-parsing";

import Timestamp from "../../common/Timestamp";
import MarkdownRenderer from "../../common/MarkdownRenderer";

const useStyles = makeStyles(
  createStyles({
    notificationRead: {
      opacity: 0.6
    }
  })
);

interface NotificationCardProps {
  notification: UserNotification;
}

const NotificationCard: React.FunctionComponent<NotificationCardProps> = props => {
  const classes = useStyles(props);

  function renderTimeAgo() {
    return <Timestamp milliseconds={props.notification.timestamp} />;
  }

  function renderTrigger() {
    if (props.notification.trigger !== "") {
      return (
        <Typography gutterBottom variant="subtitle1" component="h6">
          <span
            dangerouslySetInnerHTML={{
              __html: parseContent(props.notification.trigger)
            }}
          />
        </Typography>
      );
    }
  }

  function renderContent() {
    if (props.notification.content !== "") {
      return <MarkdownRenderer text={props.notification.content} />;
    }
  }

  return (
    <Card className={props.notification.read ? classes.notificationRead : ""}>
      <CardContent>
        {renderTimeAgo()}
        {renderTrigger()}
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
