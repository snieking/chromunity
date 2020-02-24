import { Reducer } from "redux";
import { AccountActions, AccountActionTypes, AccountState } from "./accountTypes";

const initialAccountState: AccountState = {
  loading: false,
  error: null,
  user: null
};

export const loginReducer: Reducer<AccountState, AccountActions> = (state = initialAccountState, action) => {
  if (action.type === AccountActionTypes.VAULT_CANCEL) {
    return {
      ...state,
      error: action.error,
      loading: false
    };
  } else if (action.type === AccountActionTypes.SET_USER) {
    return {
      ...state,
      user: action.user,
      loading: false
    }
  } else if (action.type === AccountActionTypes.LOGIN_ACCOUNT) {
    return {
      ...state,
      loading: true
    }
  } else if (action.type === AccountActionTypes.RESET_LOGIN_STATE) {
    return {
      ...state,
      error: null
    }
  }

  return state;
};
