import { Theme } from "@material-ui/core";

export enum StylingActionTypes {
  TOGGLE_THEME = "STYLING/THEME/TOGGLE"
}

export interface ToggleThemeAction {
  type: StylingActionTypes.TOGGLE_THEME;
}

export type StylingActions = ToggleThemeAction;

export interface StylingState {
  theme: Theme
}