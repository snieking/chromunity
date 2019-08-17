import { ActionCreator } from "redux";

import {
  AccountActionTypes,
  AccountWalletLoginInitAction
} from "../AccountTypes";

export const initWalletLogin: ActionCreator<AccountWalletLoginInitAction> = (
  accountId: string,
  keyPair: any
) => ({
  type: AccountActionTypes.WALLET_LOGIN_INIT,
  accountId: accountId,
  keyPair: keyPair
});
