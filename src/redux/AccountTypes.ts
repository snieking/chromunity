import { KeyPair } from "ft3-lib";

export enum AccountActionTypes {
  ACCOUNT_REGISTER_CHECK = "ACCOUNT/REGISTER/CHECK",
  ACCOUNT_ADD_ACCOUNT_ID = "ACCOUNT/ADD/ACCOUNT_ID",
  ACCOUNT_REGISTER = "ACCOUNT/REGISTER"
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

export type LoginActions =
  | AccountRegisteredCheckAction
  | AccountAddAccountIdAction
  | AccountRegisterAction;

export interface LoginState {
  loading: boolean;
  success: boolean;
  accountId: string;
  keyPair: KeyPair;
  username: string;
  vaultPubKey: string;
}
