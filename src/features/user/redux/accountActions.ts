import { ActionCreator } from "redux";

import {
  AccountActionTypes,
  IAutoLogin,
  IAutoLoginAttempted,
  ICheckDistrustedUsers,
  ILoginAccount,
  ILogoutAccount,
  IRegisterUser,
  IResetLoginState,
  ISaveVaultAccount,
  ISetAuthenticationStep,
  ISetUser,
  IStoreDistrustedUsers,
  IVaultCancel,
  IVaultSuccess,
  IStoreUserKudos,
  ICheckUserKudos,
  ISendKudos
} from "./accountTypes";
import { ChromunityUser } from "../../../types";
import User from "ft3-lib/dist/ft3/user/user";

export const setAuthenticationStep: ActionCreator<ISetAuthenticationStep> = authenticationStep => ({
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

export const vaultCancel: ActionCreator<IVaultCancel> = () => ({
  type: AccountActionTypes.VAULT_CANCEL
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

export const autoLoginAttempted: ActionCreator<IAutoLoginAttempted> = () => ({
  type: AccountActionTypes.AUTO_LOGIN_ATTEMPTED
});

export const checkDistrustedUsers: ActionCreator<ICheckDistrustedUsers> = (user: ChromunityUser) => ({
  type: AccountActionTypes.CHECK_DISTRUSTED_USERS,
  user
});

export const storeDistrustedUsers: ActionCreator<IStoreDistrustedUsers> = (distrustedUsers: string[]) => ({
  type: AccountActionTypes.STORE_DISTRUSTED_USERS,
  distrustedUsers
});

export const checkUserKudos: ActionCreator<ICheckUserKudos> = () => ({
  type: AccountActionTypes.CHECK_USER_KUDOS
})

export const storeUserKudos: ActionCreator<IStoreUserKudos> = (kudos: number) => ({
  type: AccountActionTypes.STORE_USER_KUDOS,
  kudos
});

export const sendKudos: ActionCreator<ISendKudos> = (receiver: string, kudos: number) => ({
  type: AccountActionTypes.SEND_KUDOS,
  receiver,
  kudos
});
