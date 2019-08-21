import { ActionCreator } from "redux";

import {
  AccountActionTypes,
  AccountAddAccountIdAction,
  AccountRegisterAction,
  AccountRegisteredCheckAction
} from "../AccountTypes";

export const accountRegisteredCheck: ActionCreator<AccountRegisteredCheckAction> = (username: string) => ({
  type: AccountActionTypes.ACCOUNT_REGISTER_CHECK,
  username: username
});

export const accountAddAccountId: ActionCreator<AccountAddAccountIdAction> = (accountId: string) => ({
  type: AccountActionTypes.ACCOUNT_ADD_ACCOUNT_ID,
  accountId: accountId
});

export const accountRegister: ActionCreator<AccountRegisterAction> = (
  accountId: string,
  username: string,
  vaultPubKey: string
) => ({
  type: AccountActionTypes.ACCOUNT_REGISTER,
  username: username,
  accountId: accountId,
  vaultPubKey: vaultPubKey
});
