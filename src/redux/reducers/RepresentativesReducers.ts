import { RepresentativesActions, RepresentativesActionTypes, RepresentativesState } from "../RepresentativeTypes";
import { Reducer } from "redux";

const initialRepresentativesState: RepresentativesState = {
  representatives: [],
  representativesLastUpdated: 0,
  unhandledReports: 0,
  unhandledReportsLastUpdated: 0
};

export const representativesReducer: Reducer<RepresentativesState, RepresentativesActions> = (state = initialRepresentativesState, action) => {
  switch (action.type) {
    case RepresentativesActionTypes.UPDATE_REPRESENTATIVES: {
      return {
        ...state,
        representatives: action.representatives,
        representativesLastUpdated: Date.now()
      }
    }
    case RepresentativesActionTypes.UPDATE_UNHANDLED_REPORTS: {
      return {
        ...state,
        unhandledReports: action.unhandledReports,
        unhandledReportsLastUpdated: Date.now()
      }
    }
  }

  return state;
};