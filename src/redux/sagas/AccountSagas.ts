import {
  AccountActionTypes, AccountWalletLoginInitAction
} from "../AccountTypes";
import { takeLatest } from "redux-saga/effects";
import { SingleSignatureAuthDescriptor, FlagsType, User } from "ft3-lib";
import { Blockchain } from "ft3-lib";
import DirectoryService from "../../blockchain/DirectoryService";
import config from "../../config.js";
import {login} from "../../blockchain/UserService";

const chainId = Buffer.from(config.blockchainRID, "hex");

export function* accountWatcher() {
  yield takeLatest(AccountActionTypes.WALLET_LOGIN_INIT, walletLogin);
}

function* walletLogin(action: AccountWalletLoginInitAction) {
  const blockchain = yield Blockchain.initialize(
    chainId,
    new DirectoryService()
  );

  const authDescriptor = new SingleSignatureAuthDescriptor(action.keyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer
  ]);

  const user = new User(action.keyPair, authDescriptor);

  checkIfAuthDescriptorAdded(blockchain, user, action.accountId)
}

function* checkIfAuthDescriptorAdded(blockchain: any, user: User, accountId: string) {
  console.log("Checking if auth descriptor has been added");
  const accounts = yield blockchain.getAccountsByParticipantId(
    user.keyPair.pubKey,
    user
  );

  const isAdded = accounts.some(( id: any ) => (
    id.toString('hex').toUpperCase() === accountId.toUpperCase()
  ));

  if (isAdded) {
    console.log("Auth descriptor was added!");
    console.log(accounts[0]);
    //DO DAPP SPECIFIC LOGIN WITH NEW KEY PAIR
  } else {
    console.log("Auth descriptor was not added, checking again in 3 seconds");
    setTimeout(checkIfAuthDescriptorAdded, 3000);
  }
}
