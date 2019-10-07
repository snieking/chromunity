import { applyMiddleware, combineReducers, compose, createStore, Store } from "redux";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/index";
import { AccountState } from "./AccountTypes";
import { TopicWallState } from "./WallTypes";
import { ChannelState } from "./ChannelTypes";
import { loginReducer } from "./reducers/AccountReducers";
import { topicWallReducer } from "./reducers/WallReducers";
import { channelReducer } from "./reducers/ChannelReducers";
import { UserPageState } from "./UserTypes";
import { userPageReducer } from "./reducers/UserPageReducers";
import { StylingState } from "./StylingTypes";
import { stylingReducer } from "./reducers/StylingReducers";
import { GovernmentState } from "./GovernmentTypes";
import { governmentReducer } from "./reducers/GovernmentReducers";
import { chatReducer } from "./reducers/ChatReducers";
import { ChatState } from "./ChatTypes";

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