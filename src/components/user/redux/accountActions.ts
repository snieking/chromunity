import { ActionCreator } from "redux";

import {
  AccountActionTypes,
  IAutoLogin,
  ILoginAccount,
  ILogoutAccount, IRegisterUser, IResetLoginState, ISaveVaultAccount, ISetAuthenticationStep,
  ISetUser,
  IVaultCancel,
  IVaultSuccess
} from "./accountTypes";
import { ChromunityUser } from "../../../types";
import User from "ft3-lib/dist/ft3/user/user";

export const setAuthenticationStep: ActionCreator<ISetAuthenticationStep> = (authenticationStep) => ({
  type: AccountActionTypes.SET_AUTHENTICATION_STEP,
  authenticationStep
});

export const saveVaultAccount: ActionCreator<ISaveVaultAccount> = (accountId: string, ft3User: User) => ({
  type: AccountActionTypes.SAVE_VAULT_ACCOUNT,
  accountId,
  ft3User
});

export const loginAccount: ActionCreator<ILoginAccount> = () => ({
  type: AccountActionTypes.LOGIN_ACCOUNT
});

export const vaultSuccess: ActionCreator<IVaultSuccess> = (rawTx: string) => ({
  type: AccountActionTypes.VAULT_SUCCESS,
  rawTx
});

export const vaultCancel: ActionCreator<IVaultCancel> = (error: string) => ({
  type: AccountActionTypes.VAULT_CANCEL,
  error
});

export const setUser: ActionCreator<ISetUser> = (user: ChromunityUser) => ({
  type: AccountActionTypes.SET_USER,
  user
});

export const autoLogin: ActionCreator<IAutoLogin> = () => ({
  type: AccountActionTypes.AUTO_LOGIN
});

export const logoutAccount: ActionCreator<ILogoutAccount> = () => ({
  type: AccountActionTypes.LOGOUT_ACCOUNT
});

export const resetLoginState: ActionCreator<IResetLoginState> = () => ({
  type: AccountActionTypes.RESET_LOGIN_STATE
});

export const registerUser: ActionCreator<IRegisterUser> = (username: string) => ({
  type: AccountActionTypes.REGISTER_USER,
  username
});
