import { Reducer } from "redux";
import { AccountActions, AccountActionTypes, AccountState, AuthenticationStep } from "./accountTypes";

const initialAccountState: AccountState = {
  authenticationStep: null,
  accountId: null,
  ft3User: null,
  user: null,
  distrustedUsers: [],
  autoLoginInProgress: true,
  kudos: 0,
};

function getCancellationStep(step: AuthenticationStep): AuthenticationStep {
  switch (step) {
    case AuthenticationStep.REGISTERING_USER:
      return AuthenticationStep.USERNAME_INPUT_REQUIRED;
    default:
      return null;
  }
}

export const loginReducer: Reducer<AccountState, AccountActions> = (state = initialAccountState, action) => {
  if (action.type === AccountActionTypes.VAULT_CANCEL) {
    return {
      ...state,
      authenticationStep: getCancellationStep(state.authenticationStep),
    };
  } else if (action.type === AccountActionTypes.SET_USER) {
    return {
      ...state,
      user: action.user,
    };
  } else if (action.type === AccountActionTypes.LOGIN_ACCOUNT) {
    return {
      ...state,
    };
  } else if (action.type === AccountActionTypes.RESET_LOGIN_STATE) {
    return {
      ...state,
      error: null,
    };
  } else if (action.type === AccountActionTypes.SAVE_VAULT_ACCOUNT) {
    return {
      ...state,
      accountId: action.accountId,
      ft3User: action.ft3User,
    };
  } else if (action.type === AccountActionTypes.SET_AUTHENTICATION_STEP) {
    return {
      ...state,
      authenticationStep: action.authenticationStep,
    };
  } else if (action.type === AccountActionTypes.AUTO_LOGIN) {
    return {
      ...state,
      autoLoginInProgress: true,
    };
  } else if (action.type === AccountActionTypes.AUTO_LOGIN_ATTEMPTED) {
    return {
      ...state,
      autoLoginInProgress: false,
    };
  } else if (action.type === AccountActionTypes.STORE_DISTRUSTED_USERS) {
    return {
      ...state,
      distrustedUsers: action.distrustedUsers,
    };
  } else if (action.type === AccountActionTypes.STORE_USER_KUDOS) {
    return {
      ...state,
      kudos: action.kudos,
    };
  }

  return state;
};
