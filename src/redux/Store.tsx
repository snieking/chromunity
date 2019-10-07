import { applyMiddleware, combineReducers, compose, createStore, Store } from "redux";
import createSagaMiddleware from "redux-saga";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
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

const persistConfig = {
  key: "root",
  storage: storage,
  stateReconciler: autoMergeLevel2
};

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

const pReducer = persistReducer<ApplicationState>(persistConfig, rootReducer);

const store = createStore(pReducer, undefined, compose(...enhancers));
export default function configureStore(): Store<ApplicationState> {
  sagaMiddleware.run(rootSaga);
  return store;
}