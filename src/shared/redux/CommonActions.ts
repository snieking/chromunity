import {
  CommonActionTypes,
  IToggleTutorial,
  ISetRateLimited,
  IUpdateRateLimited,
  ISetOperationPending,
  ISetQueryPending,
} from "./CommonTypes";
import { ActionCreator } from "redux";

export const toggleTutorial: ActionCreator<IToggleTutorial> = () => ({
  type: CommonActionTypes.TOGGLE_TUTORIAL,
});

export const setRateLimited: ActionCreator<ISetRateLimited> = () => ({
  type: CommonActionTypes.SET_RATE_LIMITED,
});

export const updateRateLimited: ActionCreator<IUpdateRateLimited> = (rateLimited: boolean) => ({
  type: CommonActionTypes.UPDATE_RATE_LIMITED,
  rateLimited,
});

export const setOperationPending: ActionCreator<ISetOperationPending> = (operationPending: boolean) => ({
  type: CommonActionTypes.SET_OPERATION_PENDING,
  operationPending,
});

export const setQueryPending: ActionCreator<ISetQueryPending> = (queryPending: boolean) => ({
  type: CommonActionTypes.SET_QUERY_PENDING,
  queryPending,
});
