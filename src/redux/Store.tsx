import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import { loginReducer } from "./reducers/AccountReducers";
import { LoginState } from "./AccountTypes";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/index";

export interface ApplicationState {
  login: LoginState;
}

const rootReducer = combineReducers<ApplicationState>({
  login: loginReducer
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
