export enum AccountActionTypes {
  WALLET_LOGIN_INIT = "WALLET/LOGIN/INIT"
}

export interface AccountWalletLoginInitAction {
  type: AccountActionTypes.WALLET_LOGIN_INIT;
  accountId: string;
  keyPair: any;
}

export type WalletLoginActions = AccountWalletLoginInitAction;

export interface WalletLoginState {
  loading: boolean;
  success: boolean;
}
