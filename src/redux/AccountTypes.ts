import { KeyPair } from "ft3-lib";

export enum AccountActionTypes {
  WALLET_LOGIN_INIT = "WALLET/LOGIN/INIT"
}

export interface AccountWalletLoginInitAction {
  type: AccountActionTypes.WALLET_LOGIN_INIT;
  keyPair: KeyPair
  accountId: string;
}

export type WalletLoginActions = AccountWalletLoginInitAction;

export interface WalletLoginState {
  loading: boolean;
  success: boolean;
}
