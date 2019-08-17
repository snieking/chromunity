import {
  AccountActionTypes,
  AccountWalletLoginInitAction
} from "../AccountTypes";
import { takeLatest } from "redux-saga/effects";
import { SingleSignatureAuthDescriptor, FlagsType, User } from "ft3-lib";
import { Blockchain, KeyPair } from "ft3-lib";
import DirectoryService from "../../blockchain/DirectoryService";
import config from "../../config.js";

const chainId = Buffer.from(config.blockchainRID, "hex");

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.WALLET_LOGIN_INIT, walletLogin);
}

function* walletLogin(action: AccountWalletLoginInitAction) {
  console.log("About to perform wallet login");
  const blockchain = yield Blockchain.initialize(
    chainId,
    new DirectoryService()
  );

  console.log("Initialized blockchain", blockchain);

  const authDescriptor = new SingleSignatureAuthDescriptor(
    action.keyPair.pubKey,
    [FlagsType.Account, FlagsType.Transfer]
  );

  console.log("Created auth descriptor", authDescriptor);
  const user = new User(action.keyPair, authDescriptor);

  checkIfAuthDescriptorAdded(blockchain, user, action.accountId, action.keyPair);

  const href = `http://localhost:3001/?route=/authorize&dappId=${config.blockchainRID}&accountId=${action.accountId}&pubkey=${action.keyPair.pubKey.toString("hex")}`;

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
