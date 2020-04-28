import { CommonActions, CommonActionTypes, CommonState } from "./CommonTypes";
import { Reducer } from "redux";

const initialCommonState: CommonState = {
  tutorial: false,
  rateLimited: false
};

export const commonReducer: Reducer<CommonState, CommonActions> = (state = initialCommonState, action) => {
  if (action.type === CommonActionTypes.TOGGLE_TUTORIAL) {
    return {
      ...state,
      tutorial: !state.tutorial
    }
  } else if (action.type === CommonActionTypes.UPDATE_RATE_LIMITED) {
    console.log("Setting rate limiting to: ", action.rateLimited);
    return {
      ...state,
      rateLimited: action.rateLimited
    }
  }

  return state;
};
