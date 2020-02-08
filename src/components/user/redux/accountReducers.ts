import { Reducer } from "redux";
import { AccountActionTypes, AccountState, AccountActions } from "./accountTypes";

const initialAccountState: AccountState = {
  loading: false,
  success: false,
  failure: false,
  error: "",
  accountId: "",
  username: "",
  keyPair: null,
  vaultPubKey: null
};

export const loginReducer: Reducer<AccountState, AccountActions> = (state = initialAccountState, action) => {
  switch (action.type) {
    case AccountActionTypes.ACCOUNT_REGISTER_CHECK: {
      return {
        ...state,
        loading: true,
        username: action.username
      };
    }
    case AccountActionTypes.ACCOUNT_ADD_ACCOUNT_ID: {
      return {
        ...state,
        accountId: action.accountId
      };
    }
    case AccountActionTypes.ACCOUNT_REGISTER: {
      return {
        ...state,
        username: action.username,
        vaultPubKey: action.vaultPubKey,
        accountId: action.accountId
      };
    }
  }

  return state;
};
