import React, { useEffect, useState } from "react";
import { ListItem } from "@material-ui/core";
import ListItemText from "@material-ui/core/ListItemText";
import { getUserSettingsCached } from "../../core/services/UserService";
import { ifEmptyAvatarThenPlaceholder } from "../../shared/util/user-util";
import Avatar, { AVATAR_SIZE } from "../../shared/Avatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { chatParticipantsListItemStyles } from "./styles";

interface Props {
  name: string
}

const ChatParticipantListItem: React.FunctionComponent<Props> = (props: Props) => {
  const classes = chatParticipantsListItemStyles(props);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (props.name != null) {
      getUserSettingsCached(props.name, 600).then(settings =>
        setAvatar(ifEmptyAvatarThenPlaceholder(settings.avatar, props.name))
      );
    }
  }, [props]);

  return (
    <ListItem button component="a" href={"/u/" + props.name} color="primary">
      {avatar.length !== 0 && (
        <ListItemIcon style={{ float: "left" }}>
          <Avatar src={avatar} size={AVATAR_SIZE.SMALL} name={props.name}/>
        </ListItemIcon>
      )}
      <ListItemText className={classes.name} primary={"@" + props.name} />
    </ListItem>
  );
};

export default ChatParticipantListItem;