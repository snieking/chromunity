import { applyMiddleware, combineReducers, compose, createStore, Store } from "redux";
import createSagaMiddleware from "redux-saga";
import { AccountState } from "./components/user/redux/accountTypes";
import { TopicWallState } from "./components/walls/redux/wallTypes";
import { ChannelState } from "./components/walls/redux/channelTypes";
import { loginReducer } from "./components/user/redux/accountReducers";
import { topicWallReducer } from "./components/walls/redux/wallReducers";
import { channelReducer } from "./components/walls/redux/channelReducers";
import { UserPageState } from "./components/user/redux/userTypes";
import { userPageReducer } from "./components/user/redux/userPageReducers";
import { StylingState } from "./components/dynamicTheme/redux/stylingTypes";
import { stylingReducer } from "./components/dynamicTheme/redux/stylingReducers";
import { chatReducer } from "./components/chat/redux/chatReducers";
import { ChatState } from "./components/chat/redux/chatTypes";
import { GovernmentState } from "./components/governing/redux/govTypes";
import { governmentReducer } from "./components/governing/redux/govReducers";
import { all } from "@redux-saga/core/effects";
import { accountWatcher } from "./components/user/redux/AccountSagas";
import { topicWallWatcher } from "./components/walls/redux/wallSagas";
import { channelWatcher } from "./components/walls/redux/channelSagas";
import { userPageWatcher } from "./components/user/redux/userPageSagas";
import { governmentWatcher } from "./components/governing/redux/govSagas";
import { chatWatcher } from "./components/chat/redux/chatSagas";

export interface ApplicationState {
  account: AccountState;
  topicWall: TopicWallState;
  channel: ChannelState;
  userPage: UserPageState;
  styling: StylingState;
  government: GovernmentState;
  chat: ChatState;
}

const rootReducer = combineReducers<ApplicationState>({
  account: loginReducer,
  topicWall: topicWallReducer,
  channel: channelReducer,
  userPage: userPageReducer,
  styling: stylingReducer,
  government: governmentReducer,
  chat: chatReducer
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
    chatWatcher()
  ]);
}