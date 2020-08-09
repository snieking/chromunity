import { AccountState } from '../features/user/redux/account-types';
import { TopicWallState } from '../features/walls/redux/wall-types';
import { ChannelState } from '../features/walls/redux/channel-types';
import { UserPageState } from '../features/user/redux/user-types';
import { StylingState } from './dynamic-theme/redux/styling-types';
import { GovernmentState } from '../features/governing/redux/gov-types';
import { ChatState } from '../features/chat/redux/chat-types';
import { CommonState } from '../shared/redux/common-types';
import { SnackbarState } from './snackbar/redux/snackbar-types';
import { StoreState } from '../features/store/redux/store-types';

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
  store: StoreState;
}
