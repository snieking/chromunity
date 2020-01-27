import { getANumber } from "./helper";
import { makeKeyPair } from "../src/blockchain/CryptoService";
import { FlagsType, KeyPair, SingleSignatureAuthDescriptor, User } from "ft3-lib";
import { BLOCKCHAIN } from "../src/blockchain/Postchain";
import { ChromunityUser } from "../src/types";

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
  "Or"
];

let adminUser: ChromunityUser;

const CREATE_RANDOM_USER = (): TestUser => {
  const randomNumber = Math.floor(Math.random() * names.length);
  const keyPair = makeKeyPair();
  return {
    name: names[randomNumber] + "_" + getANumber(),
    keyPair: new KeyPair(keyPair.privKey.toString("hex"))
  };
};

const CREATE_LOGGED_IN_USER = async () => {
  const user = CREATE_RANDOM_USER();
  return loginUser(user);
};

/**
 * Creates a user with mnemonic phrase:
 * 'return feel swing spell crack issue cousin child winter process marble arctic safe jacket color'
 */
const GET_LOGGED_IN_ADMIN_USER = async (): Promise<ChromunityUser> => {
  if (adminUser == null) {
    adminUser = await loginUser({
      name: "snieking",
      keyPair: new KeyPair("039a02bc551528e23ddcd6f9557ef1773b253f3b4dc7b60fdcf0af58ebbcdff7d7")
    });
  }
  return new Promise<ChromunityUser>(resolve => resolve(adminUser));
};

const loginUser = async (user: TestUser): Promise<ChromunityUser> => {
  const walletKeyPair = new KeyPair(makeKeyPair().privKey.toString("hex"));
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer
  ]);
  const walletUser = new User(walletKeyPair, walletAuthDescriptor);

  const authDescriptor = new SingleSignatureAuthDescriptor(user.keyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer
  ]);
  const ft3User = new User(user.keyPair, authDescriptor);

  const bc = await BLOCKCHAIN;
  const account = await bc.registerAccount(walletAuthDescriptor, walletUser);
  await bc.call(ft3User, "register_user", user.name, authDescriptor.toGTV(), walletAuthDescriptor.toGTV());

  return new Promise<ChromunityUser>(resolve => resolve({ name: user.name, ft3User: ft3User }));
};

export { GET_LOGGED_IN_ADMIN_USER, CREATE_LOGGED_IN_USER };
