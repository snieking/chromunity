import { ActionCreator } from "redux";

import {
  AccountActionTypes,
  AccountCreateCredentialsAction,
  AccountRegisterAction,
  AccountRegisterSuccessAction,
  AccountRegisterFailureAction,
  AccountLoginSuccessAction,
  AccountLoginFailureAction,
  AccountLoginSubmitAction,
  AccountImportMnemonicAction, AccountImportLoginAction
} from "../AccountTypes";

export const createCredentials: ActionCreator<
  AccountCreateCredentialsAction
> = (name: string, password: string) => ({
  type: AccountActionTypes.CREATE_CREDENTIALS,
  name: name,
  password: password
});

export const register: ActionCreator<AccountRegisterAction> = () => ({
  type: AccountActionTypes.REGISTER
});

export const registerSuccess: ActionCreator<
  AccountRegisterSuccessAction
> = () => ({
  type: AccountActionTypes.REGISTER_SUCCESS
});

export const registerFailure: ActionCreator<
  AccountRegisterFailureAction
> = () => ({
  type: AccountActionTypes.REGISTER_FAILURE
});

export const loginSuccess: ActionCreator<AccountLoginSuccessAction> = () => ({
  type: AccountActionTypes.LOGIN_SUCCESS
});

export const loginFailure: ActionCreator<AccountLoginFailureAction> = () => ({
  type: AccountActionTypes.LOGIN_FAILURE
});

export const submitLogin: ActionCreator<AccountLoginSubmitAction> = (name: string, password: string, encryptedSeed: string) => ({
  type: AccountActionTypes.SUBMIT_LOGIN,
  name: name,
  password: password,
  encryptedSeed: encryptedSeed
});

export const importLogin: ActionCreator<AccountImportLoginAction> = (name: string, password: string) => ({
  type: AccountActionTypes.IMPORT_LOGIN,
  name: name,
  password: password
});

export const importSeed: ActionCreator<AccountImportMnemonicAction> = (seed: string) => ({
  type: AccountActionTypes.IMPORT_MNEMONIC,
  mnemonic: seed
});