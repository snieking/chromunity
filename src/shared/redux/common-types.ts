export enum CommonActionTypes {
  TOGGLE_TUTORIAL = "TOGGLE/TUTORIAL",
  SET_RATE_LIMITED = "SET/RATE_LIMITED",
  UPDATE_RATE_LIMITED = "UPDATE/RATE_LIMITED",
  SET_OPERATION_PENDING = "SET/OPERATION_PENDING",
  SET_QUERY_PENDING = "SET/QUERY_PENDING",
}

export interface CommonState {
  tutorial: boolean;
  rateLimited: boolean;
  operationPending: boolean;
  queryPending: boolean;
}
