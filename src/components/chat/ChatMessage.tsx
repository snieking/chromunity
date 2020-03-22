import React, { useEffect, useState } from "react";
import { ChatMessageDecrypted } from "../../types";
import { ListItem, Typography } from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import { timeAgoReadable } from "../../util/util";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Avatar, { AVATAR_SIZE } from "../common/Avatar";
import { Link } from "react-router-dom";
import { ifEmptyAvatarThenPlaceholder } from "../../util/user-util";
import { getUserSettingsCached } from "../../blockchain/UserService";
import { chatMessageStyles } from "./styles";
import MarkdownRenderer from "../common/MarkdownRenderer";
import PreviewLinks from "../common/PreviewLinks";

interface Props {
  message: ChatMessageDecrypted;
}

const ChatMessage: React.FunctionComponent<Props> = (props: Props) => {
  const classes = chatMessageStyles(props);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    getUserSettingsCached(props.message.sender, 600).then(settings =>
      setAvatar(ifEmptyAvatarThenPlaceholder(settings.avatar, props.message.sender))
    );
  }, [props]);

  return (
    <ListItem style={{ marginBottom: "0px"}}>
      <ListItemText
        disableTypography
        primary={
          <div>
            <MarkdownRenderer text={props.message.msg}/>
            <div className={classes.linkPreviewWrapper}><PreviewLinks text={props.message.msg}/></div>
          </div>}
        secondary={<Typography className={classes.timestamp}>{timeAgoReadable(props.message.timestamp)}</Typography>}
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
