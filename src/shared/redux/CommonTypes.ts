export enum CommonActionTypes {
  TOGGLE_TUTORIAL = "TOGGLE/TUTORIAL"
}

export interface IToggleTutorial {
  type: CommonActionTypes.TOGGLE_TUTORIAL;
}

export type CommonActions = IToggleTutorial;

export interface CommonState {
  tutorial: boolean;
}