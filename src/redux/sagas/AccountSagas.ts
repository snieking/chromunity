import {
  AccountActionTypes, AccountRegisterAction, AccountRegisteredCheckAction
} from "../AccountTypes";
import { takeLatest } from "redux-saga/effects";
import { SingleSignatureAuthDescriptor, FlagsType, User } from "ft3-lib";
import { Blockchain, KeyPair } from "ft3-lib";
import DirectoryService from "../../blockchain/DirectoryService";
import config from "../../config.js";
import {getAccountId, walletRegister} from "../../blockchain/UserService";
import {BLOCKCHAIN} from "../../blockchain/Postchain";
import {accountAddAccountId} from "../actions/AccountActions";
import {getKeyPair, storeKeyPair} from "../../util/user-util";
import {makeKeyPair} from "../../blockchain/CryptoService";

const chainId = Buffer.from(config.blockchainRID, "hex");

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.ACCOUNT_REGISTER_CHECK, checkIfRegistered);
  yield takeLatest(AccountActionTypes.ACCOUNT_REGISTER, registerAccount);
}

function* checkIfRegistered(action: AccountRegisteredCheckAction) {
  console.log("Checking if account is registered");

  const accountId = yield getAccountId(action.username);
  if (!accountId) {
    const returnUrl = encodeURIComponent(`http://localhost:3000/user/register/${action.username}`);
    window.location.replace(`http://localhost:3001/?route=/link-account&returnUrl=${returnUrl}`);
  } else {
    accountAddAccountId(accountId);
    loginAccount(action.username);
  }
}

function* registerAccount(action: AccountRegisterAction) {
  console.log("Registering account");
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(
    Buffer.from(action.vaultPubKey, "hex"),
    [FlagsType.Account, FlagsType.Transfer]
  );

  const keyPair = retrieveKeyPair();

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );

  const user = new User(keyPair, authDescriptor);
  const bc = yield BLOCKCHAIN;
  console.log("Created blockchain", bc);
  yield bc.registerAccount(authDescriptor, user);
  console.log("Registered account");
  yield bc.call(user, "register_user", action.username, authDescriptor, walletAuthDescriptor);
  console.log("Registered user");
}

function* loginAccount(username: string) {
  console.log("About to perform wallet login");
  const blockchain = yield Blockchain.initialize(
    chainId,
    new DirectoryService()
  );

  console.log("Initialized blockchain", blockchain);

  let keyPair: KeyPair = getKeyPair();
  if (!keyPair) {
    const kp = makeKeyPair();
    keyPair = new KeyPair(kp.privKey.toString("hex"));
    storeKeyPair(keyPair);
  }

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );

  console.log("Created auth descriptor", authDescriptor);
  const user = new User(keyPair, authDescriptor);

  let accountId = yield getAccountId(username);
  if (!accountId) {
    const account = yield blockchain.registerAccount(authDescriptor, user);
    console.log("Registered new account: ", account);
    accountId = account.id_.toString("hex");
  }

  checkIfAuthDescriptorAdded(blockchain, user, accountId, keyPair);

  const href = `http://localhost:3001/?route=/authorize&dappId=${config.blockchainRID}&accountId=27C84A2CA56592CA3DFFA8F7F2FA02763DB4E0A0F4370C182405C7B6130F84C7&pubkey=${keyPair.pubKey.toString("hex")}`;

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
  keyPair: KeyPair
) {
  console.log("Checking if auth descriptor has been added");
  const accounts = await blockchain.getAccountsByParticipantId(
    keyPair.pubKey,
    user
  );

  const isAdded = accounts.some(
    (id: any) => {
      console.log("id", id);
      return id.toString("hex").toUpperCase() === accountId.toUpperCase();
    }
  );

  if (isAdded) {
    console.log("Auth descriptor was added!");
    console.log(accounts[0]);
    //DO DAPP SPECIFIC LOGIN WITH NEW KEY PAIR
  } else {
    console.log("Auth descriptor was not added, checking again in 3 seconds");
    setTimeout(() => checkIfAuthDescriptorAdded(blockchain, user, accountId, keyPair), 3000);
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
