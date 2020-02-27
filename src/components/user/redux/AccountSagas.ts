import { AccountActionTypes, AuthenticationStep, IRegisterUser, IVaultSuccess } from "./accountTypes";
import { takeLatest, put, select } from "redux-saga/effects";
import { op, SSOStoreLocalStorage } from "ft3-lib";
import config from "../../../config.js";
import { getUsernameByAccountId } from "../../../blockchain/UserService";
import { BLOCKCHAIN, executeOperations } from "../../../blockchain/Postchain";
import { clearSession, getUsername, setUsername } from "../../../util/user-util";
import logger from "../../../util/logger";
import { toLowerCase } from "../../../util/util";
import SSO from "ft3-lib/dist/ft3/user/sso/sso";
import User from "ft3-lib/dist/ft3/user/user";
import { saveVaultAccount, setAuthenticationStep, setUser, vaultCancel } from "./accountActions";
import { ChromunityUser } from "../../../types";
import { ApplicationState } from "../../../store";

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
}

function* loginSaga() {
  logger.silly("[SAGA - STARTED]: Login process started");
  const successUrl = encodeURI(`${config.vault.callbackBaseUrl}/vault/success/`);
  const cancelUrl = encodeURI(`${config.vault.callbackBaseUrl}/vault/cancel`);

  const BC = yield BLOCKCHAIN;
  new SSO(BC, new SSOStoreLocalStorage()).initiateLogin(successUrl, cancelUrl);
}

function* logoutSaga() {
  const BC = yield BLOCKCHAIN;
  const sso = new SSO(BC, new SSOStoreLocalStorage());

  yield sso.logout;

  clearSession();
  yield put(setUser(null));
  yield put(setAuthenticationStep(null));
}

function* vaultSuccessSaga(action: IVaultSuccess) {
  logger.silly("[SAGA - STARTED] Received success from vault");
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
    } else {
      yield put(saveVaultAccount(account.id, user));
      yield put(setAuthenticationStep(AuthenticationStep.USERNAME_INPUT_REQUIRED));
    }
  } catch (error) {
    yield put(vaultCancel("Error signing in: " + error.message));
  }
}

function* registerUserSaga(action: IRegisterUser) {
  yield put(setAuthenticationStep(AuthenticationStep.REGISTERING_USER));
  const accountId = yield select(getAccountId);
  const user = yield select(getFt3User);

  if (!accountId || !user) {
    yield put(vaultCancel("Login session was interrupted"));
    return;
  }

  try {
    yield executeOperations(user, op("register_user", action.username, accountId));
    yield authorizeUser(action.username, user);
  } catch (error) {
    yield put(vaultCancel("Error signing in: " + error.message));
  }
}

function* autoLoginSaga() {
  const foundUser = yield select(getUser);
  const username = getUsername();

  logger.silly(
    "[SAGA - STARTED] Attempting auto-login for username: [%s] and user [%s]",
    username,
    JSON.stringify(foundUser)
  );

  if (username && foundUser == null) {
    const BC = yield BLOCKCHAIN;
    const sso = new SSO(BC, new SSOStoreLocalStorage());
    const [account, user] = yield sso.autoLogin();

    logger.silly("Account [%s] and user [%s] found", JSON.stringify(account), JSON.stringify(user));
    if (account && user) {
      const usernameLinkedToAccount = yield getUsernameByAccountId(account.id);
      if (username === usernameLinkedToAccount) {
        yield authorizeUser(username, user);
      } else {
        yield sso.logout();
      }
    }
  }
}

function* authorizeUser(username: string, user: User) {
  if (username && user) {
    setUsername(username);

    logger.silly("Authorizing user: [%s]", username);
    const chromunityUser: ChromunityUser = { name: username, ft3User: user };
    yield put(setUser(chromunityUser));
    yield put(setAuthenticationStep(AuthenticationStep.AUTHENTICATED));
  } else {
    logger.info("Username [%s], or [%s] was null", username, JSON.stringify(user));
  }
}
