import { AccountActionTypes, ILoginAccount, IVaultSuccess } from "./accountTypes";
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
import { setUser, vaultCancel } from "./accountActions";
import { ChromunityUser } from "../../../types";
import { ApplicationState } from "../../../store";

SSO.vaultUrl = config.vault.url;

const getUser = (state: ApplicationState) => state.account.user;

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.LOGIN_ACCOUNT, loginSaga);
  yield takeLatest(AccountActionTypes.VAULT_SUCCESS, vaultSuccessSaga);
  yield takeLatest(AccountActionTypes.AUTO_LOGIN, autoLoginSaga);
  yield takeLatest(AccountActionTypes.LOGOUT_ACCOUNT, logoutSaga);
}

function* loginSaga(action: ILoginAccount) {
  logger.silly("[SAGA - STARTED]: Login process started for username: [%s]", action.username);
  const successUrl = encodeURI(`${config.vault.callbackBaseUrl}/user/success/${action.username}`);
  const cancelUrl = encodeURI(`${config.vault.callbackBaseUrl}/user/cancel`);

  const BC = yield BLOCKCHAIN;
  new SSO(BC, new SSOStoreLocalStorage()).initiateLogin(successUrl, cancelUrl);
}

function* logoutSaga() {
  const BC = yield BLOCKCHAIN;
  const sso = new SSO(BC, new SSOStoreLocalStorage());

  yield sso.logout;

  clearSession();
  yield put(setUser(null));
}

function* vaultSuccessSaga(action: IVaultSuccess) {
  logger.silly("[SAGA - STARTED] Received success from vault for username: [%s]", action.username);
  const BC = yield BLOCKCHAIN;

  try {
    const sso = new SSO(BC, new SSOStoreLocalStorage());
    logger.silly("RawTx: [%s]", action.rawTx);
    const [account, user] = yield sso.finalizeLogin(action.rawTx);
    logger.silly("Account [%s], user [%s]", JSON.stringify(account), JSON.stringify(user));

    const username = yield getUsernameByAccountId(account.id);
    logger.silly("Username linked to accountId: %s", username);

    if (username == null) {
      yield executeOperations(user, op("register_user", action.username, account.id));
      yield authorizeUser(username, user);
    } else if (toLowerCase(username) === toLowerCase(action.username)) {
      yield authorizeUser(username, user);
    } else {
      yield put(vaultCancel("Vault account is already linked with another user"));
    }
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
  } else {
    logger.info("Username [%s], or [%s] was null", username, JSON.stringify(user));
  }
}
