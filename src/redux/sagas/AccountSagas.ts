import {
  AccountActionTypes,
  AccountLoginAction,
  AccountRegisterAction,
  AccountRegisteredCheckAction
} from "../AccountTypes";
import { takeLatest } from "redux-saga/effects";
import { SingleSignatureAuthDescriptor, FlagsType, User, Account, op } from "ft3-lib";
import { KeyPair } from "ft3-lib";
import config from "../../config.js";
import { getAccountId } from "../../blockchain/UserService";
import { BLOCKCHAIN, executeOperations } from "../../blockchain/Postchain";
import { accountAddAccountId } from "../actions/AccountActions";
import { getKeyPair, setUsername, storeKeyPair } from "../../util/user-util";
import { makeKeyPair } from "../../blockchain/CryptoService";
import logger from "../../util/logger";

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.ACCOUNT_REGISTER_CHECK, checkIfRegistered);
  yield takeLatest(AccountActionTypes.ACCOUNT_REGISTER, registerAccount);
  yield takeLatest(AccountActionTypes.ACCOUNT_LOGIN, loginAccount);
}

function* checkIfRegistered(action: AccountRegisteredCheckAction) {
  const accountId = yield getAccountId(action.username);
  if (!accountId) {
    logger.debug("Account [%s] didn't exist, registering with wallet", action.username);
    const returnUrl = encodeURIComponent(`${config.vault.callbackBaseUrl}/user/register/${action.username}`);
    window.location.replace(`${config.vault.url}/?route=/link-account&returnUrl=${returnUrl}`);
  } else {
    logger.debug("Account [%s] existed, logging in with wallet", action.username);
    accountAddAccountId(accountId);
    yield walletLogin(action.username);
  }
}

function* registerAccount(action: AccountRegisterAction) {
  logger.debug("Registering new account for username [%s]", action.username);
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(Buffer.from(action.vaultPubKey, "hex"), [
    FlagsType.Account,
    FlagsType.Transfer
  ]);

  const keyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));
  storeKeyPair(keyPair);

  const authDescriptor = new SingleSignatureAuthDescriptor(keyPair.pubKey, [FlagsType.Account, FlagsType.Transfer]);

  const user = new User(keyPair, authDescriptor);

  logger.debug("Registering user");
  yield executeOperations(
    user,
    op("register_user", action.username, authDescriptor.toGTV(), walletAuthDescriptor.toGTV())
  );
  logger.debug("Logged in user with username: ", action.username);

  authorizeUser(action.username);
}

function* walletLogin(username: string) {
  logger.debug("Logging in [%s] with wallet", username);
  let keyPair: KeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));
  storeKeyPair(keyPair);

  let accountId = yield getAccountId(username);

  const returnUrl = encodeURIComponent(`${config.vault.callbackBaseUrl}/user/authorize/${username}/${accountId}`);
  window.location.replace(
    `${config.vault.url}/?route=/authorize&dappId=${
      config.blockchain.rid
    }&accountId=${accountId}&pubkey=${keyPair.pubKey.toString("hex")}&successAction=${returnUrl}`
  );
}

function* loginAccount(action: AccountLoginAction) {
  logger.debug("Logging in account [%s] by checking for auth descriptor", action.username);
  let keyPair: KeyPair = retrieveKeyPair();

  const authDescriptor = new SingleSignatureAuthDescriptor(keyPair.pubKey, [FlagsType.Account, FlagsType.Transfer]);

  const user = new User(keyPair, authDescriptor);

  const blockchain = yield BLOCKCHAIN;

  checkIfAuthDescriptorAdded(blockchain, user, action.accountId, action.username);
}

async function checkIfAuthDescriptorAdded(blockchain: any, user: User, accountId: string, username: string) {
  logger.debug("Checking auth descriptor for username [%s]", username);
  const accounts = await blockchain.getAccountsByAuthDescriptorId(user.authDescriptor.hash(), user);

  const isAdded = accounts.some((account: Account) => {
    return account.id_.toString("hex").toUpperCase() === accountId.toUpperCase();
  });

  if (isAdded) {
    authorizeUser(username);
  } else {
    setTimeout(() => checkIfAuthDescriptorAdded(blockchain, user, accountId, username), 3000);
  }
}

function retrieveKeyPair(): KeyPair {
  let keyPair: KeyPair = getKeyPair();
  if (!keyPair) {
    const kp = makeKeyPair();
    keyPair = new KeyPair(kp.privKey.toString("hex"));
  }

  return keyPair;
}

function authorizeUser(username: string) {
  setUsername(username);
  window.location.href = "/";
}
