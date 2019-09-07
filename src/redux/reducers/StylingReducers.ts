import { StylingActions, StylingActionTypes, StylingState } from "../StylingTypes";
import { darkTheme, lightTheme } from "../../theme";
import { Reducer } from "redux";

const initialStyling: StylingState = {
  theme: "dark" === localStorage.getItem("theme") ? darkTheme : lightTheme
};

export const stylingReducer: Reducer<StylingState, StylingActions> = (state = initialStyling, action) => {
  switch (action.type) {
    case StylingActionTypes.TOGGLE_THEME: {
      const isCurrentlyDarkTheme = state.theme === darkTheme;
      localStorage.setItem("theme", isCurrentlyDarkTheme ? "light" : "dark");
      return {
        ...state,
        theme: isCurrentlyDarkTheme ? lightTheme : darkTheme
      };
    }
  }

  return state;
};
