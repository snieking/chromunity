import { setOperationPending, setQueryPending } from './../../../shared/redux/CommonActions';
import { notifySuccess, setError } from '../../../core/snackbar/redux/snackbarTypes';
import {
  AccountActionTypes,
  AuthenticationStep,
  ICheckDistrustedUsers,
  IRegisterUser,
  IVaultSuccess
} from "./accountTypes";
import { takeLatest, put, select } from "redux-saga/effects";
import { op, SSOStoreLocalStorage } from "ft3-lib";
import config from "../../../config.js";
import { getDistrustedUsers, getUsernameByAccountId } from "../../../core/services/UserService";
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
  vaultCancel
} from "./accountActions";
import { ChromunityUser } from "../../../types";
import { ApplicationState } from "../../../core/store";
import { toLowerCase } from "../../../shared/util/util";
import { userEvent } from "../../../shared/util/matomo";

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
}

function* loginSaga() {
  logger.silly("[SAGA - STARTED]: Login process started");
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

function* vaultSuccessSaga(action: IVaultSuccess): Generator<any, any, any> {
  logger.silly("[SAGA - STARTED] Received success from vault");
  yield put(setQueryPending(true));
  yield put(setAuthenticationStep(AuthenticationStep.CONFIRMING_VAULT_TRANSACTION));
  const BC = yield BLOCKCHAIN;

  try {
    const sso = new SSO(BC, new SSOStoreLocalStorage());
    logger.silly("RawTx: [%s]", action.rawTx);
    const [account, user] = yield sso.finalizeLogin(action.rawTx);
    logger.silly("Account [%s], user [%s]", JSON.stringify(account), JSON.stringify(user));

    const username = yield getUsernameByAccountId(account.id);
    logger.silly("Username linked to accountId: %s", username);

    if (username) {
      yield authorizeUser(username, user);
      yield put(notifySuccess("Successfully signed in"));
      userEvent("sign-in");
    } else {
      yield put(saveVaultAccount(account.id, user));
      yield put(setAuthenticationStep(AuthenticationStep.USERNAME_INPUT_REQUIRED));
    }
  } catch (error) {
    yield put(vaultCancel());
    yield put(setError("Error signing in: " + error.message));
  } finally {
    yield put(setQueryPending(false));
  }
}

function* registerUserSaga(action: IRegisterUser) {
  yield put(setAuthenticationStep(AuthenticationStep.REGISTERING_USER));
  const accountId = yield select(getAccountId);
  const user = yield select(getFt3User);

  if (!accountId || !user) {
    yield put(vaultCancel());
    yield put(setError("Login session was interrupted"));
    return;
  }

  yield put(setOperationPending(true));

  try {
    yield executeOperations(user, op("register_user", action.username, accountId));
    yield authorizeUser(action.username, user);
    userEvent("register");
  } catch (error) {
    yield put(vaultCancel());
    yield put(setError("Error signing in: " + error.message))
  } finally {
    yield put(setOperationPending(false));
  }
}

function* autoLoginSaga(): Generator<any, any, any> {
  const foundUser = yield select(getUser);
  const username = getUsername();

  logger.silly(
    "[SAGA - STARTED] Attempting auto-login for username: [%s] and user [%s]",
    username,
    JSON.stringify(foundUser)
  );

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

export function* checkDistrustedUsersSaga(action: ICheckDistrustedUsers) {
  logger.silly("[SAGA - STARTED]: Checking distrusted reps");
  const distrustedReps = action.user != null ? yield getDistrustedUsers(action.user) : [];
  yield put(storeDistrustedUsers(distrustedReps));
  logger.silly("[SAGA - FINISHED]: Checking distrusted reps");
}
