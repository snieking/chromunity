import {Reducer} from "redux";
import {
  AccountActionTypes,
  CreateAccountActions,
  CreateAccountState,
  ImportAccountActions,
  ImportAccountState,
  LoginAccountActions,
  LoginAccountState
} from "../AccountTypes";
import * as bip39 from "bip39";

const initialCreateAccountState: CreateAccountState = {
  loading: false,
  name: "",
  password: "",
  mnemonic: "",
  failure: false,
  success: false,
  error: ""
};

export const createAccountReducer: Reducer<
  CreateAccountState,
  CreateAccountActions
> = (state = initialCreateAccountState, action) => {
  switch (action.type) {
    case AccountActionTypes.CREATE_CREDENTIALS: {
      return {
        ...state,
        loading: false,
        name: action.name,
        password: action.password,
        mnemonic: bip39.generateMnemonic(160)
      };
    }
    case AccountActionTypes.REGISTER: {
      return {
        ...state,
        loading: true
      };
    }
    case AccountActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        loading: false,
        success: true
      };
    }
    case AccountActionTypes.REGISTER_FAILURE: {
      return {
        ...state,
        loading: false,
        failure: true,
        error: "Failed to sign up, try another account name"
      };
    }
    case AccountActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        loading: false,
        failure: true,
        error: "Failed to login after successful sign up"
      };
    }
  }
  return state;
};

const initialLoginAccountState: LoginAccountState = {
  loading: false,
  success: false,
  failure: false,
  error: ""
};

export const loginAccountReducer: Reducer<
  LoginAccountState,
  LoginAccountActions
> = (state = initialLoginAccountState, action) => {
  switch (action.type) {
    case AccountActionTypes.SUBMIT_LOGIN: {
      return {
        ...state,
        loading: true
      };
    }
    case AccountActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        loading: false,
        success: true
      };
    }
    case AccountActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        loading: false,
        failure: true,
        error: "Failed to login, is the password correct?"
      };
    }
  }
  return state;
};

const initialImportAccountState: ImportAccountState = {
  loading: false,
  mnemonic: "",
  success: false,
  failure: false,
  error: ""
};

export const importAccountReducer: Reducer<
  ImportAccountState,
  ImportAccountActions
> = (state = initialImportAccountState, action) => {
  switch (action.type) {
    case AccountActionTypes.IMPORT_MNEMONIC: {
      return {
        ...state,
        mnemonic: action.mnemonic
      }
    }
    case AccountActionTypes.IMPORT_LOGIN: {
      return {
        ...state,
        loading: true
      }
    }
    case AccountActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        loading: false,
        success: true
      }
    }
    case AccountActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        loading: false,
        failure: true,
        error: "Failed to login, is the password correct?"
      }
    }
  }
  return state;
};
