import { setOperationPending, setQueryPending } from './../../../shared/redux/CommonActions';
import { notifySuccess, notifyError } from '../../../core/snackbar/redux/snackbarActions';
import {
  AccountActionTypes,
  AuthenticationStep
} from "./accountTypes";
import { takeLatest, put, select } from "redux-saga/effects";
import { op, SSOStoreLocalStorage } from "ft3-lib";
import config from "../../../config.js";
import { getDistrustedUsers, getUsernameByAccountId, getKudos, sendKudos } from "../../../core/services/UserService";
import { BLOCKCHAIN, executeOperations } from "../../../core/services/Postchain";
import { clearSession, getUsername, setUsername } from "../../../shared/util/user-util";
import logger from "../../../shared/util/logger";
import SSO from "ft3-lib/dist/ft3/user/sso/sso";
import User from "ft3-lib/dist/ft3/user/user";
import {
  autoLoginAttempted,
  checkDistrustedUsers,
  saveVaultAccount,
  setAuthenticationStep,
  setUser,
  storeDistrustedUsers,
  vaultCancel,
  storeUserKudos,
  checkUserKudos,
  registerUser,
  vaultSuccess,
  sendKudos as sendKudosAction
} from "./accountActions";
import { ChromunityUser } from "../../../types";
import ApplicationState from "../../../core/application-state";
import { toLowerCase } from "../../../shared/util/util";
import { userEvent } from "../../../shared/util/matomo";
import { Action } from '@reduxjs/toolkit';

SSO.vaultUrl = config.vault.url;

const getAccountId = (state: ApplicationState) => state.account.accountId;
const getFt3User = (state: ApplicationState) => state.account.ft3User;
const getUser = (state: ApplicationState) => state.account.user;

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.LOGIN_ACCOUNT, loginSaga);
  yield takeLatest(AccountActionTypes.VAULT_SUCCESS, vaultSuccessSaga);
  yield takeLatest(AccountActionTypes.REGISTER_USER, registerUserSaga);
  yield takeLatest(AccountActionTypes.AUTO_LOGIN, autoLoginSaga);
  yield takeLatest(AccountActionTypes.LOGOUT_ACCOUNT, logoutSaga);
  yield takeLatest(AccountActionTypes.CHECK_DISTRUSTED_USERS, checkDistrustedUsersSaga);
  yield takeLatest(AccountActionTypes.CHECK_USER_KUDOS, checkUserKudosSaga);
  yield takeLatest(AccountActionTypes.SEND_KUDOS, sendKudosSaga);
}

function* loginSaga() {
  const successUrl = encodeURI(`${config.vault.callbackBaseUrl}/vault/success/`);
  const cancelUrl = encodeURI(`${config.vault.callbackBaseUrl}/vault/cancel`);

  const BC = yield BLOCKCHAIN;
  new SSO(BC, new SSOStoreLocalStorage()).initiateLogin(successUrl, cancelUrl);
}

function* logoutSaga() {
  yield put(setOperationPending(true));
  const BC = yield BLOCKCHAIN;
  const sso = new SSO(BC, new SSOStoreLocalStorage());

  yield sso.logout;

  clearSession();
  yield put(setUser(null));
  yield put(setAuthenticationStep(null));
  yield put(setOperationPending(false));
  yield put(notifySuccess("Successfully signed out"));
}

function* vaultSuccessSaga(action: Action): Generator<any, any, any> {
  if (vaultSuccess.match(action)) {
    yield put(setQueryPending(true));
    yield put(setAuthenticationStep(AuthenticationStep.CONFIRMING_VAULT_TRANSACTION));
    const BC = yield BLOCKCHAIN;

    try {
      const sso = new SSO(BC, new SSOStoreLocalStorage());
      logger.silly("RawTx: [%s]", action.payload);
      const [account, user] = yield sso.finalizeLogin(action.payload);
      logger.silly("Account [%s], user [%s]", JSON.stringify(account), JSON.stringify(user));

      const username = yield getUsernameByAccountId(account.id);
      logger.silly("Username linked to accountId: %s", username);

      if (username) {
        yield authorizeUser(username, user);
        yield put(notifySuccess("Successfully signed in"));
        userEvent("sign-in");
      } else {
        yield put(saveVaultAccount({ accountId: account.id, ft3User: user }));
        yield put(setAuthenticationStep(AuthenticationStep.USERNAME_INPUT_REQUIRED));
      }
    } catch (error) {
      yield put(vaultCancel());
      yield put(notifyError("Error signing in: " + error.message));
    } finally {
      yield put(setQueryPending(false));
    }
  }
}

function* registerUserSaga(action: Action) {
  if (registerUser.match(action)) {
    yield put(setAuthenticationStep(AuthenticationStep.REGISTERING_USER));
    const accountId = yield select(getAccountId);
    const user = yield select(getFt3User);

    if (!accountId || !user) {
      yield put(vaultCancel());
      yield put(notifyError("Login session was interrupted"));
      return;
    }

    yield put(setOperationPending(true));

    try {
      yield executeOperations(user, op("register_user", action.payload, accountId));
      yield authorizeUser(action.payload, user);
      userEvent("register");
    } catch (error) {
      yield put(vaultCancel());
      yield put(notifyError("Error signing in: " + error.message))
    } finally {
      yield put(setOperationPending(false));
    }
  }
}

function* autoLoginSaga(): Generator<any, any, any> {
  const foundUser = yield select(getUser);
  const username = getUsername();

  yield put(setQueryPending(true));

  const BC = yield BLOCKCHAIN;
  const sso = new SSO(BC, new SSOStoreLocalStorage());

  if (username && foundUser == null) {
    try {
      const [account, user] = yield sso.autoLogin();

      logger.silly("Account [%s] and user [%s] found", JSON.stringify(account), JSON.stringify(user));
      if (account && user) {
        const usernameLinkedToAccount = yield getUsernameByAccountId(account.id);
        if (usernameLinkedToAccount && toLowerCase(username) === toLowerCase(usernameLinkedToAccount)) {
          yield authorizeUser(username, user);
        } else {
          yield sso.logout();
        }
      }
    } catch (error) {
      localStorage.clear();
      sessionStorage.clear();
      yield put(autoLoginAttempted());
    }
  }

  yield put(autoLoginAttempted());
  yield put(setQueryPending(false));
}

function* authorizeUser(username: string, user: User) {
  if (username && user) {
    setUsername(username);

    logger.silly("Authorizing user: [%s]", username);
    const chromunityUser: ChromunityUser = { name: username, ft3User: user };
    yield put(setUser(chromunityUser));
    yield put(setAuthenticationStep(AuthenticationStep.AUTHENTICATED));
    yield put(checkDistrustedUsers(chromunityUser));
    userEvent("authenticate");
  } else {
    logger.info("Username [%s], or [%s] was null", username, JSON.stringify(user));
  }
}

export function* checkDistrustedUsersSaga(action: Action) {
  if (checkDistrustedUsers.match(action)) {
    const distrustedReps = action.payload != null ? yield getDistrustedUsers(action.payload) : [];
    yield put(storeDistrustedUsers(distrustedReps));
  }
}

export function* checkUserKudosSaga() {
  const user = yield select(getUser);

  if (user && config.features.kudosEnabled) {
    const kudos = yield getKudos(user.name);
    yield put(storeUserKudos(kudos));
  }
}

export function* sendKudosSaga(action: Action) {
  if (sendKudosAction.match(action)) {
    const user = yield select(getUser);

    if (user && config.features.kudosEnabled) {
      yield sendKudos(user, action.payload.receiver, action.payload.kudos);
      yield put(checkUserKudos());
      yield put(notifySuccess(`Sent ${action.payload.kudos} kudos to ${action.payload.receiver}`));
    }
  }
}
