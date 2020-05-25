import { CommonActions, CommonActionTypes, CommonState } from "./CommonTypes";
import { Reducer } from "redux";

const initialCommonState: CommonState = {
  tutorial: false,
  rateLimited: false,
  queryPending: false,
  operationPending: false,
};

export const commonReducer: Reducer<CommonState, CommonActions> = (state = initialCommonState, action) => {
  switch (action.type) {
    case CommonActionTypes.TOGGLE_TUTORIAL: {
      return {
        ...state,
        tutorial: !state.tutorial,
      };
    }
    case CommonActionTypes.UPDATE_RATE_LIMITED: {
      return {
        ...state,
        rateLimited: action.rateLimited,
      };
    }
    case CommonActionTypes.SET_OPERATION_PENDING: {
      return {
        ...state,
        operationPending: action.operationPending,
      };
    }
    case CommonActionTypes.SET_QUERY_PENDING: {
      return {
        ...state,
        queryPending: action.queryPending,
      };
    }
  }

  return state;
};
