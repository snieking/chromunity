import { CommonActionTypes, IToggleTutorial, ISetRateLimited, IUpdateRateLimited } from "./CommonTypes";
import { ActionCreator } from "redux";

export const toggleTutorial: ActionCreator<IToggleTutorial> = () => ({
  type: CommonActionTypes.TOGGLE_TUTORIAL
});

export const setRateLimited: ActionCreator<ISetRateLimited> = () => ({
  type: CommonActionTypes.SET_RATE_LIMITED
});

export const updateRateLimited: ActionCreator<IUpdateRateLimited> = (rateLimited: boolean) => ({
  type: CommonActionTypes.UPDATE_RATE_LIMITED,
  rateLimited
})
