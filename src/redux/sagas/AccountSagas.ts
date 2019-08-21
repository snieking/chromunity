import { AccountActionTypes, AccountRegisterAction, AccountRegisteredCheckAction } from "../AccountTypes";
import { takeLatest } from "redux-saga/effects";
import { SingleSignatureAuthDescriptor, FlagsType, User, Account } from "ft3-lib";
import { KeyPair } from "ft3-lib";
import config from "../../config.js";
import { getAccountId } from "../../blockchain/UserService";
import { BLOCKCHAIN } from "../../blockchain/Postchain";
import { accountAddAccountId } from "../actions/AccountActions";
import { getKeyPair, setUsername, storeKeyPair } from "../../util/user-util";
import { makeKeyPair } from "../../blockchain/CryptoService";

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.ACCOUNT_REGISTER_CHECK, checkIfRegistered);
  yield takeLatest(AccountActionTypes.ACCOUNT_REGISTER, registerAccount);
}

function* checkIfRegistered(action: AccountRegisteredCheckAction) {
  const accountId = yield getAccountId(action.username);
  if (!accountId) {
    const returnUrl = encodeURIComponent(`${config.chromunityUrl}/user/register/${action.username}`);
    window.location.replace(`${config.vaultUrl}/?route=/link-account&returnUrl=${returnUrl}`);
  } else {
    accountAddAccountId(accountId);
    yield loginAccount(action.username);
  }
}

function* registerAccount(action: AccountRegisterAction) {
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(Buffer.from(action.vaultPubKey, "hex"), [
    FlagsType.Account,
    FlagsType.Transfer
  ]);

  const keyPair = retrieveKeyPair();

  const authDescriptor = new SingleSignatureAuthDescriptor(keyPair.pubKey, [FlagsType.Account, FlagsType.Transfer]);

  const user = new User(keyPair, authDescriptor);
  const bc = yield BLOCKCHAIN;
  yield bc.call(user, "register_user", action.username, authDescriptor.toGTV(), walletAuthDescriptor.toGTV());
  authorizeUser(action.username, keyPair);
}

function* loginAccount(username: string) {
  let keyPair: KeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));

  const authDescriptor = new SingleSignatureAuthDescriptor(keyPair.pubKey, [FlagsType.Account, FlagsType.Transfer]);

  const user = new User(keyPair, authDescriptor);
  let accountId = yield getAccountId(username);
  const blockchain = yield BLOCKCHAIN;
  checkIfAuthDescriptorAdded(blockchain, user, accountId, username, keyPair);

  const href = `${config.vaultUrl}/?route=/authorize&dappId=${
    config.blockchainRID
  }&accountId=${accountId}&pubkey=${keyPair.pubKey.toString("hex")}`;

  let newWindow = window.open(
    href,
    "vault",
    `toolbar=no,
  location=no,
  status=no,
  menubar=no,
  scrollbars=yes,
  resizable=yes`
  );

  if (!newWindow.focus) {
    newWindow.focus();
  }
}

async function checkIfAuthDescriptorAdded(blockchain: any, user: User, accountId: string, username: string, keyPair: KeyPair) {
  const accounts = await blockchain.getAccountsByAuthDescriptorId(user.authDescriptor.hash(), user);

  const isAdded = accounts.some((account: Account) => {
    return account.id_.toString("hex").toUpperCase() === accountId.toUpperCase();
  });

  if (isAdded) {
    authorizeUser(username, keyPair);
  } else {
    setTimeout(() => checkIfAuthDescriptorAdded(blockchain, user, accountId, username, keyPair), 3000);
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

function authorizeUser(username: string, keyPair: KeyPair) {
  setUsername(username);
  storeKeyPair(keyPair);
  window.location.replace("/");
}
