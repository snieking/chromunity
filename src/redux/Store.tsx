import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/index";
import { AccountState } from "./AccountTypes";
import { TopicWallState } from "./WallTypes";
import { ChannelState } from "./ChannelTypes";
import { loginReducer } from "./reducers/AccountReducers";
import { topicWallReducer } from "./reducers/WallReducers";
import { channelReducer } from "./reducers/ChannelReducers";

export interface ApplicationState {
  account: AccountState;
  topicWall: TopicWallState;
  channel: ChannelState;
}

const rootReducer = combineReducers<ApplicationState>({
  account: loginReducer,
  topicWall: topicWallReducer,
  channel: channelReducer
});

const sagaMiddleware = createSagaMiddleware({
  onError: () => {
    window.location.replace("/error");
  }
});

const store = createStore(rootReducer, undefined, applyMiddleware(sagaMiddleware));

export default function configureStore(): Store<ApplicationState> {
  sagaMiddleware.run(rootSaga);
  return store;
}
