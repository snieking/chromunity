import { ActionCreator } from "redux";
import { StylingActionTypes, ToggleThemeAction } from "./stylingTypes";

export const toggleTheme: ActionCreator<ToggleThemeAction> = () => ({
  type: StylingActionTypes.TOGGLE_THEME
});