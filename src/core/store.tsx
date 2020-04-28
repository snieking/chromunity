import { applyMiddleware, combineReducers, compose, createStore, Store } from "redux";
import createSagaMiddleware from "redux-saga";
import { AccountState } from "../features/user/redux/accountTypes";
import { TopicWallState } from "../features/walls/redux/wallTypes";
import { ChannelState } from "../features/walls/redux/channelTypes";
import { loginReducer } from "../features/user/redux/accountReducers";
import { topicWallReducer } from "../features/walls/redux/wallReducers";
import { channelReducer } from "../features/walls/redux/channelReducers";
import { UserPageState } from "../features/user/redux/userTypes";
import { userPageReducer } from "../features/user/redux/userPageReducers";
import { StylingState } from "./dynamic-theme/redux/stylingTypes";
import { stylingReducer } from "./dynamic-theme/redux/stylingReducers";
import { chatReducer } from "../features/chat/redux/chatReducers";
import { ChatState } from "../features/chat/redux/chatTypes";
import { GovernmentState } from "../features/governing/redux/govTypes";
import { governmentReducer } from "../features/governing/redux/govReducers";
import { all } from "@redux-saga/core/effects";
import { accountWatcher } from "../features/user/redux/AccountSagas";
import { topicWallWatcher } from "../features/walls/redux/wallSagas";
import { channelWatcher } from "../features/walls/redux/channelSagas";
import { userPageWatcher } from "../features/user/redux/userPageSagas";
import { governmentWatcher } from "../features/governing/redux/govSagas";
import { chatWatcher } from "../features/chat/redux/chatSagas";
import { CommonState } from "../shared/redux/CommonTypes";
import { commonReducer } from "../shared/redux/CommonReducers";
import { SnackbarState } from "./snackbar/redux/snackbarTypes";
import { snackbarReducer } from "./snackbar/redux/snackbarReducers";
import { commonWatcher } from "../shared/redux/CommonSagas";

export interface ApplicationState {
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

const rootReducer = combineReducers<ApplicationState>({
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

// Create Redux Store
const middleware = [];
const enhancers = [];

// Create Saga MiddleWare
const sagaMiddleware = createSagaMiddleware({
  onError: () => {
    window.location.href = "/error";
  }
});
middleware.push(sagaMiddleware);

// Assemble Middleware
enhancers.push(applyMiddleware(...middleware));

const store = createStore(rootReducer, undefined, compose(...enhancers));
export default function configureStore(): Store<ApplicationState> {
  sagaMiddleware.run(rootSaga);
  return store;
}

function* rootSaga() {
  yield all([
    accountWatcher(),
    topicWallWatcher(),
    channelWatcher(),
    userPageWatcher(),
    governmentWatcher(),
    chatWatcher(),
    commonWatcher()
  ]);
}
