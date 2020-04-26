import { CommonActions, CommonActionTypes, CommonState } from "./CommonTypes";
import { Reducer } from "redux";

const initialCommonState: CommonState = {
  tutorial: false
};

export const commonReducer: Reducer<CommonState, CommonActions> = (state = initialCommonState, action) => {
  if (action.type === CommonActionTypes.TOGGLE_TUTORIAL) {
    console.log("Toggling tutorial, previous was: " + state.tutorial);
    return {
      ...state,
      tutorial: !state.tutorial
    }
  }

  return state;
};