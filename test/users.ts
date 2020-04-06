import { getANumber } from "./helper";
import { makeKeyPair } from "../src/blockchain/CryptoService";
import { Account, FlagsType, KeyPair, op, SingleSignatureAuthDescriptor, User } from "ft3-lib";
import { BLOCKCHAIN } from "../src/blockchain/Postchain";
import { ChromunityUser } from "../src/types";
import Transaction from "ft3-lib/dist/ft3/core/transaction";

interface TestUser {
  name: string;
  keyPair: KeyPair;
}

const names: string[] = [
  "Anastasia",
  "Viktor",
  "Alex",
  "Riccardo",
  "Henrik",
  "Gus",
  "Irene",
  "Amy",
  "Todd",
  "Olle",
  "Alisa",
  "Or",
  "Joso"
];

const CREATE_LOGGED_IN_USER = async (name?: string) => {
  const user = name ? CREATE_USER(name) : CREATE_RANDOM_USER();
  return loginDappUser(user);
};

const CREATE_USER = (name: string): TestUser => {
  const keyPair = makeKeyPair();
  return {
    name: name + getANumber(),
    keyPair: new KeyPair(keyPair.privKey.toString("hex"))
  };
};

const CREATE_RANDOM_USER = (): TestUser => {
  const randomNumber = Math.floor(Math.random() * names.length);
  return CREATE_USER(names[randomNumber]);
};

const loginDappUser = async (user: TestUser): Promise<ChromunityUser> => {
  const walletKeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer
  ]);
  const walletUser = new User(walletKeyPair, walletAuthDescriptor);

  const authDescriptor = new SingleSignatureAuthDescriptor(user.keyPair.pubKey, []);
  const ft3User = new User(user.keyPair, authDescriptor);

  const bc = await BLOCKCHAIN;
  const account = await bc.registerAccount(walletAuthDescriptor, walletUser);

  const rawTx = Account.rawTransactionAddAuthDescriptor(
    account.id, walletUser, authDescriptor, bc
  );

  await Transaction.fromRawTransaction(rawTx, bc)
    .sign(ft3User.keyPair)
    .post();

  await bc.call(op("register_user", user.name, account.id), ft3User);

  return new Promise<ChromunityUser>(resolve => resolve({ name: user.name, ft3User: ft3User }));
};

export { CREATE_LOGGED_IN_USER };
