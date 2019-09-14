import { applyMiddleware, combineReducers, createStore, Store } from "redux";
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

export interface ApplicationState {
  account: AccountState;
  topicWall: TopicWallState;
  channel: ChannelState;
  userPage: UserPageState;
  styling: StylingState;
  government: GovernmentState;
}

const rootReducer = combineReducers<ApplicationState>({
  account: loginReducer,
  topicWall: topicWallReducer,
  channel: channelReducer,
  userPage: userPageReducer,
  styling: stylingReducer,
  government: governmentReducer
});

const sagaMiddleware = createSagaMiddleware({
  onError: () => {
    window.location.href = "/error";
  }
});

const store = createStore(rootReducer, undefined, applyMiddleware(sagaMiddleware));

export default function configureStore(): Store<ApplicationState> {
  sagaMiddleware.run(rootSaga);
  return store;
}
