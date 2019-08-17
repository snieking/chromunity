import {Reducer} from "redux";
import {
  AccountActionTypes,
  WalletLoginActions,
  WalletLoginState
} from "../AccountTypes";

const initialWalletLoginState: WalletLoginState = {
  loading: false,
  success: false
};

export const walletLoginReducer: Reducer<
  WalletLoginState,
  WalletLoginActions
> = (state = initialWalletLoginState, action) => {
  switch (action.type) {
    case AccountActionTypes.WALLET_LOGIN_INIT: {
      return {
        ...state,
        loading: true
      }
    }
  }

  return state;
};