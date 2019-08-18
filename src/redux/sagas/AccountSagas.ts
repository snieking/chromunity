import {
  AccountActionTypes,
  AccountRegisterAction,
  AccountRegisteredCheckAction
} from "../AccountTypes";
import { takeLatest } from "redux-saga/effects";
import {
  SingleSignatureAuthDescriptor,
  FlagsType,
  User,
  Account,
  BlockchainSession
} from "ft3-lib";
import { KeyPair } from "ft3-lib";
import config from "../../config.js";
import { getAccountId } from "../../blockchain/UserService";
import { BLOCKCHAIN } from "../../blockchain/Postchain";
import { accountAddAccountId } from "../actions/AccountActions";
import {
  getKeyPair,
  setAuthorizedUser,
  storeKeyPair
} from "../../util/user-util";
import { makeKeyPair } from "../../blockchain/CryptoService";
import { ChromunityUser } from "../../types";

export function* accountWatcher() {
  yield takeLatest(
    AccountActionTypes.ACCOUNT_REGISTER_CHECK,
    checkIfRegistered
  );
  yield takeLatest(AccountActionTypes.ACCOUNT_REGISTER, registerAccount);
}

function* checkIfRegistered(action: AccountRegisteredCheckAction) {
  console.log("Checking if account is registered");

  const accountId = yield getAccountId(action.username);
  if (!accountId) {
    const returnUrl = encodeURIComponent(
      `http://localhost:3000/user/register/${action.username}`
    );
    window.location.replace(
      `http://localhost:3001/?route=/link-account&returnUrl=${returnUrl}`
    );
  } else {
    accountAddAccountId(accountId);
    yield loginAccount(action.username);
  }
}

function* registerAccount(action: AccountRegisterAction) {
  console.log("Registering account");
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(
    Buffer.from(action.vaultPubKey, "hex"),
    [FlagsType.Account, FlagsType.Transfer]
  );

  const keyPair = retrieveKeyPair();

  const authDescriptor = new SingleSignatureAuthDescriptor(keyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer
  ]);

  const user = new User(keyPair, authDescriptor);
  const bc = yield BLOCKCHAIN;
  console.log("Created blockchain", bc);
  yield bc.call(
    user,
    "register_user",
    action.username,
    authDescriptor.toGTV(),
    walletAuthDescriptor.toGTV()
  );
  console.log("Registered user");
  authorizeUser(action.username, bc.newSession(user));
}

function* loginAccount(username: string) {
  console.log("About to perform wallet login");

  let keyPair: KeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));

  const authDescriptor = new SingleSignatureAuthDescriptor(keyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer
  ]);

  console.log("Created auth descriptor", authDescriptor);
  const user = new User(keyPair, authDescriptor);

  let accountId = yield getAccountId(username);

  const blockchain = yield BLOCKCHAIN;
  checkIfAuthDescriptorAdded(blockchain, user, accountId, username);

  const href = `http://localhost:3001/?route=/authorize&dappId=${
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

async function checkIfAuthDescriptorAdded(
  blockchain: any,
  user: User,
  accountId: string,
  username: string
) {
  console.log("Checking if auth descriptor has been added");
  const accounts = await blockchain.getAccountsByAuthDescriptorId(
    user.authDescriptor.hash(),
    user
  );

  const isAdded = accounts.some((account: Account) => {
    console.log("id", account.id_.toString("hex"));
    return (
      account.id_.toString("hex").toUpperCase() === accountId.toUpperCase()
    );
  });

  if (isAdded) {
    console.log("Auth descriptor was added!");
    console.log(accounts[0]);
    authorizeUser(username, blockchain.newSession(user));
  } else {
    console.log("Auth descriptor was not added, checking again in 3 seconds");
    setTimeout(
      () => checkIfAuthDescriptorAdded(blockchain, user, accountId, username),
      3000
    );
  }
}

function retrieveKeyPair(): KeyPair {
  let keyPair: KeyPair = getKeyPair();
  if (!keyPair) {
    const kp = makeKeyPair();
    keyPair = new KeyPair(kp.privKey.toString("hex"));
    storeKeyPair(keyPair);
  }

  return keyPair;
}

function authorizeUser(username: string, session: BlockchainSession): void {
  const chromunityUser: ChromunityUser = { name: username, bcSession: session };
  setAuthorizedUser(chromunityUser);
  window.location.replace("/");
}
