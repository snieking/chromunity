import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import { walletLoginReducer } from "./reducers/AccountReducers";
import { WalletLoginState } from "./AccountTypes";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas/index";

export interface ApplicationState {
  walletLogin: WalletLoginState;
}

const rootReducer = combineReducers<ApplicationState>({
  walletLogin: walletLoginReducer
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
