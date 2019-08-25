import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import { loginReducer } from "./reducers/AccountReducers";
import { AccountState } from "./AccountTypes";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/index";
import { TopicWallState } from "./WallTypes";
import { topicWallReducer } from "./reducers/WallReducers";

export interface ApplicationState {
  account: AccountState;
  topicWall: TopicWallState;
}

const rootReducer = combineReducers<ApplicationState>({
  account: loginReducer,
  topicWall: topicWallReducer
});

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(): Store<ApplicationState> {
  const store = createStore(
    rootReducer,
    undefined,
    applyMiddleware(sagaMiddleware)
  );
  sagaMiddleware.run(rootSaga);
  return store;
}
