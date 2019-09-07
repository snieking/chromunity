import { ActionCreator } from "redux";
import { StylingActionTypes, ToggleThemeAction } from "../StylingTypes";

export const toggleTheme: ActionCreator<ToggleThemeAction> = () => ({
  type: StylingActionTypes.TOGGLE_THEME
});