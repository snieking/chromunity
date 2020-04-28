export enum CommonActionTypes {
  TOGGLE_TUTORIAL = "TOGGLE/TUTORIAL",
  SET_RATE_LIMITED = "SET/RATE_LIMITED",
  UPDATE_RATE_LIMITED = "UPDATE/RATE_LIMITED",
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

export type CommonActions = IToggleTutorial | ISetRateLimited | IUpdateRateLimited;

export interface CommonState {
  tutorial: boolean;
  rateLimited: boolean;
}
