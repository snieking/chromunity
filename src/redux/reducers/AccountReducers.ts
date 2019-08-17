import {Reducer} from "redux";
import {AccountActionTypes, LoginActions, LoginState} from "../AccountTypes";

const initialLoginState: LoginState = {
  loading: false,
  success: false,
  accountId: "",
  username: "",
  keyPair: null,
  vaultPubKey: null
};

export const loginReducer: Reducer<LoginState, LoginActions> = (
  state = initialLoginState,
  action
) => {
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
      console.log("REGISTERING ACCOUNT!");
      return {
        ...state,
        username: action.username,
        vaultPubKey: action.vaultPubKey,
        accountId: action.accountId
      }
    }
  }

  return state;
};
