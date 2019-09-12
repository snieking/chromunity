import { StylingActions, StylingActionTypes, StylingState } from "../StylingTypes";
import { darkTheme, lightTheme } from "../../theme";
import { Reducer } from "redux";
import { gaGenericEvent } from "../../GoogleAnalytics";
import { Theme } from "@material-ui/core";

const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;

function getInitialTheme(): Theme {
  const previousSelectedTheme = localStorage.getItem("theme");

  if ("light" === previousSelectedTheme) return lightTheme;
  if ("dark" === previousSelectedTheme) return darkTheme;
  if (isDarkMode) return darkTheme;
  if (isLightMode) return lightTheme;

  return darkTheme;
}

const initialStyling: StylingState = {
  theme: getInitialTheme()
};

export const stylingReducer: Reducer<StylingState, StylingActions> = (state = initialStyling, action) => {
  switch (action.type) {
    case StylingActionTypes.TOGGLE_THEME: {
      const isCurrentlyDarkTheme = state.theme === darkTheme;
      const selectedTheme = isCurrentlyDarkTheme ? "light" : "dark";
      localStorage.setItem("theme", selectedTheme);
      gaGenericEvent("theme", "Selected " + selectedTheme + " theme");

      return {
        ...state,
        theme: isCurrentlyDarkTheme ? lightTheme : darkTheme
      };
    }
  }

  return state;
};
