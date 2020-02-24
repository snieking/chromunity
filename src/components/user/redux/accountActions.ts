import { ActionCreator } from "redux";

import {
  AccountActionTypes,
  IAutoLogin,
  ILoginAccount,
  ILogoutAccount, IResetLoginState,
  ISetUser,
  IVaultCancel,
  IVaultSuccess
} from "./accountTypes";
import { ChromunityUser } from "../../../types";

export const loginAccount: ActionCreator<ILoginAccount> = (username: string) => ({
  type: AccountActionTypes.LOGIN_ACCOUNT,
  username
});

export const vaultSuccess: ActionCreator<IVaultSuccess> = (rawTx: string, username: string) => ({
  type: AccountActionTypes.VAULT_SUCCESS,
  rawTx,
  username
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
