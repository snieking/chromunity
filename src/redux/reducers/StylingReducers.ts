import { StylingActions, StylingActionTypes, StylingState } from "../StylingTypes";
import { darkTheme, lightTheme } from "../../theme";
import { Reducer } from "redux";
import { gaGenericEvent } from "../../GoogleAnalytics";

const initialStyling: StylingState = {
  theme: "light" === localStorage.getItem("theme") ? lightTheme : darkTheme
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
