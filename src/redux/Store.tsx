import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import {createAccountReducer, importAccountReducer, loginAccountReducer} from "./reducers/AccountReducers";
import {CreateAccountState, ImportAccountState, LoginAccountState} from "./AccountTypes";
import createSagaMiddleware from 'redux-saga'
import rootSaga from "./sagas/index";

export interface ApplicationState {
  createAccount: CreateAccountState;
  loginAccount: LoginAccountState;
  importAccount: ImportAccountState;
}

const rootReducer = combineReducers<ApplicationState>({
  createAccount: createAccountReducer,
  loginAccount: loginAccountReducer,
  importAccount: importAccountReducer
});

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(): Store<ApplicationState>{
  const store = createStore(rootReducer, undefined, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(rootSaga);
  return store;
}