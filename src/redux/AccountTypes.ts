export enum AccountActionTypes {
  CREATE_CREDENTIALS = "ACCOUNT/CREATE_CREDENTIALS",
  REGISTER = "ACCOUNT/REGISTER",
  REGISTER_SUCCESS = "ACCOUNT/REGISTER/SUCCESS",
  REGISTER_FAILURE = "ACCOUNT/REGISTER/FAILURE",
  SUBMIT_LOGIN = "ACCOUNT/LOGIN/SUBMIT",
  LOGIN_SUCCESS = "ACCOUNT/LOGIN/SUCCESS",
  LOGIN_FAILURE = "ACCOUNT/LOGIN/FAILURE",
  IMPORT_MNEMONIC = "ACCOUNT/IMPORT_SEED",
  IMPORT_LOGIN = "ACCOUNT/IMPORT_LOGIN"
}

export interface AccountCreateCredentialsAction {
  type: AccountActionTypes.CREATE_CREDENTIALS;
  name: string;
  password: string;
}

export interface AccountRegisterAction {
  type: AccountActionTypes.REGISTER;
}

export interface AccountRegisterSuccessAction {
  type: AccountActionTypes.REGISTER_SUCCESS;
}

export interface AccountRegisterFailureAction {
  type: AccountActionTypes.REGISTER_FAILURE;
}

export interface AccountLoginSuccessAction {
  type: AccountActionTypes.LOGIN_SUCCESS;
}

export interface AccountLoginFailureAction {
  type: AccountActionTypes.LOGIN_FAILURE;
}

export interface AccountLoginSubmitAction {
  type: AccountActionTypes.SUBMIT_LOGIN;
  name: string;
  password: string;
  encryptedSeed: string;
}

export interface AccountImportMnemonicAction {
  type: AccountActionTypes.IMPORT_MNEMONIC;
  mnemonic: string;
}

export interface AccountImportLoginAction {
  type: AccountActionTypes.IMPORT_LOGIN;
  name: string;
  password: string;
}

export type CreateAccountActions =
  | AccountCreateCredentialsAction
  | AccountRegisterAction
  | AccountRegisterSuccessAction
  | AccountRegisterFailureAction
  | AccountLoginSuccessAction
  | AccountLoginFailureAction;

export type LoginAccountActions =
  | AccountLoginSubmitAction
  | AccountLoginSuccessAction
  | AccountLoginFailureAction;

export type ImportAccountActions =
  | AccountImportMnemonicAction
  | AccountImportLoginAction
  | AccountLoginSuccessAction
  | AccountLoginFailureAction;

export interface CreateAccountState {
  loading: boolean;
  name: string;
  password: string;
  mnemonic: string;
  success: boolean;
  failure: boolean;
  error: string;
}

export interface LoginAccountState {
  loading: boolean;
  success: boolean;
  failure: boolean;
  error: string;
}

export interface ImportAccountState {
  loading: boolean;
  mnemonic: string;
  success: boolean;
  failure: boolean;
  error: string;
}
