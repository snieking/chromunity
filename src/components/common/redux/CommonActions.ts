import { CommonActionTypes, IToggleTutorial } from "./CommonTypes";
import { ActionCreator } from "redux";

export const toggleTutorial: ActionCreator<IToggleTutorial> = () => ({
  type: CommonActionTypes.TOGGLE_TUTORIAL
});