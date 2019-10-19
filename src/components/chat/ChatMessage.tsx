import React, { useEffect, useState } from "react";
import { ChatMessageDecrypted } from "../../types";
import { createStyles, ListItem, makeStyles, Theme, Typography } from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import { timeAgoReadable } from "../../util/util";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import { Link } from "react-router-dom";
import { ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import { getUserSettingsCached } from "../../blockchain/UserService";

interface Props {
  message: ChatMessageDecrypted;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    message: {
      background: "none",
      maxWidth: "100%",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      wordBreak: "break-word"
    },
    author: {
      margin: "0 auto"
    },
    authorName: {
      marginTop: "2px",
      textAlign: "center"
    }
  })
);

const ChatMessage: React.FunctionComponent<Props> = (props: Props) => {
  const classes = useStyles(props);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    getUserSettingsCached(props.message.sender, 600).then(settings =>
      setAvatar(ifEmptyAvatarThenPlaceholder(settings.avatar, props.message.sender))
    );
  }, [props]);

  return (
    <ListItem>
      <ListItemText
        primary={props.message.msg}
        secondary={timeAgoReadable(props.message.timestamp)}
        classes={{ primary: classes.message }}
      />
      <div className={classes.author}>
        <ListItemIcon style={{ float: "right" }}>
          <Avatar src={avatar} size={AVATAR_SIZE.SMALL} name={props.message.sender}/>
        </ListItemIcon>
        <br />
        <Link to={"/u/" + props.message.sender}>
          <Typography gutterBottom variant="subtitle2" component="p" className={classes.authorName}>
            @{props.message.sender}
          </Typography>
        </Link>
      </div>
    </ListItem>
  );
};

export default ChatMessage;
