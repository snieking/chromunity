import { createAction } from '@reduxjs/toolkit';
import { AccountActionTypes, ISaveVaultAccount, ISendKudos, AuthenticationStep } from './account-types';
import { ChromunityUser } from '../../../types';
import { withPayloadType } from '../../../shared/redux/util';

export const setAuthenticationStep = createAction(
  AccountActionTypes.SET_AUTHENTICATION_STEP,
  withPayloadType<AuthenticationStep>()
);

export const saveVaultAccount = createAction(
  AccountActionTypes.SAVE_VAULT_ACCOUNT,
  withPayloadType<ISaveVaultAccount>()
);

export const loginAccount = createAction(AccountActionTypes.LOGIN_ACCOUNT);

export const vaultSuccess = createAction(AccountActionTypes.VAULT_SUCCESS, withPayloadType<string>());

export const vaultCancel = createAction(AccountActionTypes.VAULT_CANCEL);

export const setUser = createAction(AccountActionTypes.SET_USER, withPayloadType<ChromunityUser>());

export const autoLogin = createAction(AccountActionTypes.AUTO_LOGIN);

export const logoutAccount = createAction(AccountActionTypes.LOGOUT_ACCOUNT);

export const resetLoginState = createAction(AccountActionTypes.RESET_LOGIN_STATE);

export const registerUser = createAction(AccountActionTypes.REGISTER_USER, withPayloadType<string>());

export const autoLoginAttempted = createAction(AccountActionTypes.AUTO_LOGIN_ATTEMPTED);

export const checkDistrustedUsers = createAction(
  AccountActionTypes.CHECK_DISTRUSTED_USERS,
  withPayloadType<ChromunityUser>()
);

export const storeDistrustedUsers = createAction(
  AccountActionTypes.STORE_DISTRUSTED_USERS,
  withPayloadType<string[]>()
);

export const checkUserKudos = createAction(AccountActionTypes.CHECK_USER_KUDOS);

export const storeUserKudos = createAction(AccountActionTypes.STORE_USER_KUDOS, withPayloadType<number>());

export const sendKudos = createAction(AccountActionTypes.SEND_KUDOS, withPayloadType<ISendKudos>());
