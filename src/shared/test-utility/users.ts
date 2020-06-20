import { Account, FlagsType, KeyPair, op, SingleSignatureAuthDescriptor, User } from 'ft3-lib';
import Transaction from 'ft3-lib/dist/ft3/core/transaction';
import { getANumber } from './helper';
import { makeKeyPair } from '../../core/services/crypto-service';
import { BLOCKCHAIN } from '../../core/services/postchain';
import { ChromunityUser } from '../../types';

interface TestUser {
  name: string;
  keyPair: KeyPair;
}

const names: string[] = [
  'Anastasia',
  'Viktor',
  'Alex',
  'Riccardo',
  'Henrik',
  'Gus',
  'Irene',
  'Amy',
  'Todd',
  'Olle',
  'Alisa',
  'Or',
  'Joso',
];

const createLoggedInUser = async (name?: string) => {
  const user = name ? createUser(name) : createRandomUser();
  return loginDappUser(user);
};

const createUser = (name: string): TestUser => {
  const keyPair = makeKeyPair();
  return {
    name: name + getANumber(),
    keyPair: new KeyPair(keyPair.privKey.toString('hex')),
  };
};

const createRandomUser = (): TestUser => {
  const randomNumber = Math.floor(Math.random() * names.length);
  return createUser(names[randomNumber]);
};

const loginDappUser = async (user: TestUser): Promise<ChromunityUser> => {
  const walletKeyPair = new KeyPair(makeKeyPair().privKey.toString('hex'));
  const walletAuthDescriptor = new SingleSignatureAuthDescriptor(walletKeyPair.pubKey, [
    FlagsType.Account,
    FlagsType.Transfer,
  ]);
  const walletUser = new User(walletKeyPair, walletAuthDescriptor);

  const authDescriptor = new SingleSignatureAuthDescriptor(user.keyPair.pubKey, []);
  const ft3User = new User(user.keyPair, authDescriptor);

  const bc = await BLOCKCHAIN;
  const account = await bc.registerAccount(walletAuthDescriptor, walletUser);

  const rawTx = Account.rawTransactionAddAuthDescriptor(account.id, walletUser, authDescriptor, bc);

  await Transaction.fromRawTransaction(rawTx, bc).sign(ft3User.keyPair).post();

  await bc.call(op('register_user', user.name, account.id), ft3User);

  return new Promise<ChromunityUser>((resolve) => resolve({ name: user.name, ft3User }));
};

export { createLoggedInUser };
