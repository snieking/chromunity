import { Reducer } from "redux";
import { AccountActions, AccountActionTypes, AccountState } from "./accountTypes";

const initialAccountState: AccountState = {
  authenticationStep: null,
  loading: false,
  error: null,
  accountId: null,
  ft3User: null,
  user: null
};

export const loginReducer: Reducer<AccountState, AccountActions> = (state = initialAccountState, action) => {
  if (action.type === AccountActionTypes.VAULT_CANCEL) {
    return {
      ...state,
      error: action.error,
      loading: false,
      authenticationStep: null
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
  } else if (action.type === AccountActionTypes.SAVE_VAULT_ACCOUNT) {
    return {
      ...state,
      accountId: action.accountId,
      ft3User: action.ft3User
    }
  } else if (action.type === AccountActionTypes.SET_AUTHENTICATION_STEP) {
    return {
      ...state,
      authenticationStep: action.authenticationStep
    }
  }

  return state;
};
