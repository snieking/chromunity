import {
  AccountActionTypes, AccountRegisterAction, AccountRegisteredCheckAction
} from "../AccountTypes";
import { takeLatest } from "redux-saga/effects";
import { SingleSignatureAuthDescriptor, FlagsType, User, Account } from "ft3-lib";
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

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );

  const user = new User(keyPair, authDescriptor);
  const bc = yield BLOCKCHAIN;
  console.log("Created blockchain", bc);
  console.log("Registered account");
  yield bc.call(user, "register_user", action.username, authDescriptor.toGTV(), walletAuthDescriptor.toGTV());
  console.log("Registered user");
}

function* loginAccount(username: string) {
  console.log("About to perform wallet login");
  const blockchain = yield BLOCKCHAIN;

  console.log("Initialized blockchain", blockchain);

  let keyPair: KeyPair = new KeyPair(makeKeyPair().privKey.toString('hex'));

  const authDescriptor = new SingleSignatureAuthDescriptor(
    keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );

  console.log("Created auth descriptor", authDescriptor);
  const user = new User(keyPair, authDescriptor);

  let accountId = yield getAccountId(username);

  checkIfAuthDescriptorAdded(blockchain, user, accountId, keyPair);

  const href = `http://localhost:3001/?route=/authorize&dappId=${config.blockchainRID}&accountId=${accountId}&pubkey=${keyPair.pubKey.toString("hex")}`;

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
  const accounts = await blockchain.getAccountsByAuthDescriptorId(
    user.authDescriptor.hash(),
    user
  );

  const isAdded = accounts.some(
    (account: Account) => {
      console.log("id", account.id_.toString('hex'));
      return account.id_.toString("hex").toUpperCase() === accountId.toUpperCase();
    }
  );

  if (isAdded) {
    console.log("Auth descriptor was added!");
    console.log(accounts[0]);
    storeKeyPair(keyPair);
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
