import { loginReducer } from "../features/user/redux/accountReducers";
import { topicWallReducer } from "../features/walls/redux/wallReducers";
import { channelReducer } from "../features/walls/redux/channelReducers";
import { userPageReducer } from "../features/user/redux/userPageReducers";
import { stylingReducer } from "./dynamic-theme/redux/stylingReducers";
import { governmentReducer } from "../features/governing/redux/govReducers";
import { chatReducer } from "../features/chat/redux/chatReducers";
import { commonReducer } from "../shared/redux/CommonReducers";
import { snackbarReducer } from "./snackbar/redux/snackbarReducers";
import { combineReducers } from "redux";
import ApplicationState from "./application-state";

const reducer = combineReducers<ApplicationState>({
  account: loginReducer,
  topicWall: topicWallReducer,
  channel: channelReducer,
  userPage: userPageReducer,
  styling: stylingReducer,
  government: governmentReducer,
  chat: chatReducer,
  common: commonReducer,
  snackbar: snackbarReducer
});

export default reducer;
