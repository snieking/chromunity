export enum CommonActionTypes {
  TOGGLE_TUTORIAL = "TOGGLE/TUTORIAL",
  SET_RATE_LIMITED = "SET/RATE_LIMITED",
  UPDATE_RATE_LIMITED = "UPDATE/RATE_LIMITED",
  SET_OPERATION_PENDING = "SET/OPERATION_PENDING",
  SET_QUERY_PENDING = "SET/QUERY_PENDING",
}

export interface IToggleTutorial {
  type: CommonActionTypes.TOGGLE_TUTORIAL;
}

export interface ISetRateLimited {
  type: CommonActionTypes.SET_RATE_LIMITED;
}

export interface IUpdateRateLimited {
  type: CommonActionTypes.UPDATE_RATE_LIMITED;
  rateLimited: boolean;
}

export interface ISetOperationPending {
  type: CommonActionTypes.SET_OPERATION_PENDING;
  operationPending: boolean;
}

export interface ISetQueryPending {
  type: CommonActionTypes.SET_QUERY_PENDING;
  queryPending: boolean;
}

export type CommonActions =
  | IToggleTutorial
  | ISetRateLimited
  | IUpdateRateLimited
  | ISetOperationPending
  | ISetQueryPending;

export interface CommonState {
  tutorial: boolean;
  rateLimited: boolean;
  operationPending: boolean;
  queryPending: boolean;
}
