import { darkTheme, lightTheme } from "../../../theme";
import { genericEvent } from "../../../util/eventHandler";
import { Theme } from "@material-ui/core";
import { Reducer } from "redux";
import { StylingActions, StylingActionTypes, StylingState } from "./stylingTypes";

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
      genericEvent("theme", "Selected " + selectedTheme + " theme");

      return {
        ...state,
        theme: isCurrentlyDarkTheme ? lightTheme : darkTheme
      };
    }
  }

  return state;
};
