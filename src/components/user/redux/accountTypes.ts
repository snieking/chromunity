import { KeyPair } from "ft3-lib";

export enum AccountActionTypes {
  ACCOUNT_REGISTER_CHECK = "ACCOUNT/REGISTER/CHECK",
  ACCOUNT_ADD_ACCOUNT_ID = "ACCOUNT/ADD/ACCOUNT_ID",
  ACCOUNT_REGISTER = "ACCOUNT/REGISTER",
  ACCOUNT_CREATE_SESSION = "ACCOUNT/CREATE_SESSION",
  ACCOUNT_LOGIN = "ACCOUNT/LOGIN"
}

export interface AccountRegisteredCheckAction {
  type: AccountActionTypes.ACCOUNT_REGISTER_CHECK;
  username: string;
}

export interface AccountAddAccountIdAction {
  type: AccountActionTypes.ACCOUNT_ADD_ACCOUNT_ID;
  accountId: string;
}

export interface AccountRegisterAction {
  type: AccountActionTypes.ACCOUNT_REGISTER;
  accountId: string;
  username: string;
  vaultPubKey: string;
}

export interface AccountLoginAction {
  type: AccountActionTypes.ACCOUNT_LOGIN;
  username: string;
  accountId: string;
}

export type AccountActions =
  | AccountRegisteredCheckAction
  | AccountAddAccountIdAction
  | AccountRegisterAction
  | AccountLoginAction;

export interface AccountState {
  loading: boolean;
  success: boolean;
  failure: boolean;
  error: string;
  accountId: string;
  keyPair: KeyPair;
  username: string;
  vaultPubKey: string;
}
