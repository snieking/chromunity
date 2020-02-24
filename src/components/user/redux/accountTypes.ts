import { ChromunityUser } from "../../../types";

export enum AccountActionTypes {
  LOGIN_ACCOUNT = "LOGIN/ACCOUNT",
  VAULT_SUCCESS = "VAULT/SUCCESS",
  VAULT_CANCEL = "VAULT/CANCEL",
  SET_USER = "VAULT/SET/USER",
  AUTO_LOGIN = "AUTO/LOGIN/ACCOUNT",
  LOGOUT_ACCOUNT = "LOGOUT/ACCOUNT",
  RESET_LOGIN_STATE = "ACCOUNT/LOGIN/RESET"
}

export interface ILoginAccount {
  type: AccountActionTypes.LOGIN_ACCOUNT;
  username: string;
}

export interface IVaultSuccess {
  type: AccountActionTypes.VAULT_SUCCESS;
  rawTx: string;
  username: string;
}

export interface IVaultCancel {
  type: AccountActionTypes.VAULT_CANCEL;
  error: string;
}

export interface ISetUser {
  type: AccountActionTypes.SET_USER;
  user: ChromunityUser;
}

export interface IAutoLogin {
  type: AccountActionTypes.AUTO_LOGIN;
}

export interface ILogoutAccount {
  type: AccountActionTypes.LOGOUT_ACCOUNT;
}

export interface IResetLoginState {
  type: AccountActionTypes.RESET_LOGIN_STATE;
}

export type AccountActions =
  | ILoginAccount
  | IVaultSuccess
  | IVaultCancel
  | ISetUser
  | IAutoLogin
  | ILogoutAccount
  | IResetLoginState;

export interface AccountState {
  loading: boolean;
  error: string;
  user: ChromunityUser;
}
