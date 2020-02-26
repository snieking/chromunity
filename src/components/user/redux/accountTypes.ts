import { ChromunityUser } from "../../../types";
import User from "ft3-lib/dist/ft3/user/user";

export enum AccountActionTypes {
  SET_AUTHENTICATION_STEP = "SET/AUTHENTICATION/STEP",
  LOGIN_ACCOUNT = "LOGIN/ACCOUNT",
  VAULT_SUCCESS = "VAULT/SUCCESS",
  VAULT_CANCEL = "VAULT/CANCEL",
  SAVE_VAULT_ACCOUNT = "STORE/VAULT/ACCOUNT",
  SET_USER = "VAULT/SET/USER",
  AUTO_LOGIN = "AUTO/LOGIN/ACCOUNT",
  LOGOUT_ACCOUNT = "LOGOUT/ACCOUNT",
  RESET_LOGIN_STATE = "ACCOUNT/LOGIN/RESET",
  REGISTER_USER = "ACCOUNT/REGISTER/USER"
}

export interface ILoginAccount {
  type: AccountActionTypes.LOGIN_ACCOUNT;
}

export interface ISaveVaultAccount {
  type: AccountActionTypes.SAVE_VAULT_ACCOUNT;
  accountId: string;
  ft3User: User;
}

export interface IVaultSuccess {
  type: AccountActionTypes.VAULT_SUCCESS;
  rawTx: string;
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

export interface ISetAuthenticationStep {
  type: AccountActionTypes.SET_AUTHENTICATION_STEP;
  authenticationStep: AuthenticationStep;
}

export interface IRegisterUser {
  type: AccountActionTypes.REGISTER_USER;
  username: string;
}

export type AccountActions =
  | ILoginAccount
  | ISetAuthenticationStep
  | ISaveVaultAccount
  | IVaultSuccess
  | IVaultCancel
  | ISetUser
  | IAutoLogin
  | ILogoutAccount
  | IResetLoginState
  | IRegisterUser;

export enum AuthenticationStep {
  VAULT_IN_PROGRESS,
  CONFIRMING_VAULT_TRANSACTION,
  USERNAME_INPUT_REQUIRED,
  REGISTERING_USER,
  AUTHENTICATED
}

export interface AccountState {
  loading: boolean;
  authenticationStep: AuthenticationStep;
  error: string;
  accountId: string;
  ft3User: User;
  user: ChromunityUser;
}
