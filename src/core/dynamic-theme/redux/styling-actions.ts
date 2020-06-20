import { ActionCreator } from 'redux';
import { StylingActionTypes, ToggleThemeAction } from './styling-types';

export const toggleTheme: ActionCreator<ToggleThemeAction> = () => ({
  type: StylingActionTypes.TOGGLE_THEME,
});
