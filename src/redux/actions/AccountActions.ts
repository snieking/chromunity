import { ActionCreator } from "redux";

import {
  AccountActionTypes,
  AccountWalletLoginInitAction
} from "../AccountTypes";

export const initWalletLogin: ActionCreator<AccountWalletLoginInitAction> = (
  keyPair: any,
  accountId: string
) => ({
  type: AccountActionTypes.WALLET_LOGIN_INIT,
  keyPair: keyPair,
  accountId: accountId
});
