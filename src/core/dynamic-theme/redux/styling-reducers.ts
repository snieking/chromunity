import { Theme } from '@material-ui/core';
import { Reducer } from 'redux';
import { darkTheme, lightTheme } from '../../../theme';
import { StylingActions, StylingActionTypes, StylingState } from './styling-types';
import { generalEvent } from '../../../shared/util/matomo';

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;

function getInitialTheme(): Theme {
  const previousSelectedTheme = localStorage.getItem('theme');

  if (previousSelectedTheme === 'light') return lightTheme;
  if (previousSelectedTheme === 'dark') return darkTheme;
  if (isDarkMode) return darkTheme;
  if (isLightMode) return lightTheme;

  return darkTheme;
}

const initialStyling: StylingState = {
  theme: getInitialTheme(),
};

export const stylingReducer: Reducer<StylingState, StylingActions> = (state = initialStyling, action) => {
  switch (action.type) {
    case StylingActionTypes.TOGGLE_THEME: {
      const isCurrentlyDarkTheme = state.theme === darkTheme;
      const selectedTheme = isCurrentlyDarkTheme ? 'light' : 'dark';
      localStorage.setItem('theme', selectedTheme);
      generalEvent(`toggle-${selectedTheme}-theme`);

      return {
        ...state,
        theme: isCurrentlyDarkTheme ? lightTheme : darkTheme,
      };
    }
    default:
      return state;
  }
};
