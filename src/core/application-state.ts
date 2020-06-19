import { AccountState } from "../features/user/redux/accountTypes";
import { TopicWallState } from "../features/walls/redux/wallTypes";
import { ChannelState } from "../features/walls/redux/channelTypes";
import { UserPageState } from "../features/user/redux/userTypes";
import { StylingState } from "./dynamic-theme/redux/stylingTypes";
import { GovernmentState } from "../features/governing/redux/govTypes";
import { ChatState } from "../features/chat/redux/chatTypes";
import { CommonState } from "../shared/redux/CommonTypes";
import { SnackbarState } from "./snackbar/redux/snackbarTypes";

export default interface ApplicationState {
  account: AccountState;
  topicWall: TopicWallState;
  channel: ChannelState;
  userPage: UserPageState;
  styling: StylingState;
  government: GovernmentState;
  chat: ChatState;
  common: CommonState;
  snackbar: SnackbarState;
}
