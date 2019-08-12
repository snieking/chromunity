import {login, register} from "../../blockchain/UserService";
import {
  AccountActionTypes,
  AccountImportLoginAction,
  AccountLoginSubmitAction,
  CreateAccountState, ImportAccountState
} from "../AccountTypes";
import { takeLatest, select, put } from "redux-saga/effects";
import { ApplicationState } from "../Store";
import {loginFailure, loginSuccess, registerFailure, registerSuccess} from "../actions/AccountActions";
import {decrypt, seedFromMnemonic} from "../../blockchain/CryptoService";

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.REGISTER, registerAccount);
  yield takeLatest(AccountActionTypes.REGISTER_SUCCESS, registerAccountSuccess);
  yield takeLatest(AccountActionTypes.SUBMIT_LOGIN, loginAccount);
  yield takeLatest(AccountActionTypes.IMPORT_LOGIN, importLogin);
}

function* registerAccount() {
  const state: CreateAccountState = yield select(
    (state: ApplicationState) => state.createAccount
  );

  try {
    yield register(state.name, state.password, state.mnemonic);
    yield put(registerSuccess());
  } catch (error) {
    yield put(registerFailure());
  }
}

function* registerAccountSuccess() {
  const state: CreateAccountState = yield select(
    (state: ApplicationState) => state.createAccount
  );

  try {
    yield login(state.name, state.password, seedFromMnemonic(state.mnemonic, state.password));
    yield put(loginSuccess());
  } catch (error) {
    yield put(loginFailure());
  }
}

function* loginAccount(action: AccountLoginSubmitAction) {
  try {
    yield login(action.name, action.password, decrypt(action.encryptedSeed, action.password));
    yield put(loginSuccess());
  } catch (error) {
    yield put(loginFailure());
  }
}

function* importLogin(action: AccountImportLoginAction) {
  const state: ImportAccountState = yield select(
    (state: ApplicationState) => state.importAccount
  );

  try {
    yield login(action.name, action.password, seedFromMnemonic(state.mnemonic, action.password));
    yield put(loginSuccess());
  } catch (error) {
    yield put(loginFailure());
  }
}

