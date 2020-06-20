import { combineReducers } from 'redux';
import { loginReducer } from '../features/user/redux/account-reducers';
import { topicWallReducer } from '../features/walls/redux/wall-reducers';
import { channelReducer } from '../features/walls/redux/channel-reducers';
import { userPageReducer } from '../features/user/redux/user-page-reducers';
import { stylingReducer } from './dynamic-theme/redux/styling-reducers';
import { governmentReducer } from '../features/governing/redux/gov-reducers';
import { chatReducer } from '../features/chat/redux/chat-reducers';
import { commonReducer } from '../shared/redux/common-reducers';
import { snackbarReducer } from './snackbar/redux/snackbar-reducers';
import ApplicationState from './application-state';

const reducer = combineReducers<ApplicationState>({
  account: loginReducer,
  topicWall: topicWallReducer,
  channel: channelReducer,
  userPage: userPageReducer,
  styling: stylingReducer,
  government: governmentReducer,
  chat: chatReducer,
  common: commonReducer,
  snackbar: snackbarReducer,
});

export default reducer;
