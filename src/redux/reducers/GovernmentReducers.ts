import { GovernmentActions, GovernmentActionTypes, GovernmentState } from "../GovernmentTypes";
import { Reducer } from "redux";

const initialGovernmentState: GovernmentState = {
  representatives: [],
  representativesLastUpdated: 0,
  unhandledReports: 0,
  unhandledReportsLastUpdated: 0,
  activeElection: false,
  activeElectionLastUpdated: 0,
  recentLogbookEntryTimestamp: 0,
  lastNewLogbookCheck: 0
};

export const governmentReducer: Reducer<GovernmentState, GovernmentActions> = (state = initialGovernmentState, action) => {
  switch (action.type) {
    case GovernmentActionTypes.UPDATE_REPRESENTATIVES: {
      return {
        ...state,
        representatives: action.representatives,
        representativesLastUpdated: Date.now()
      }
    }
    case GovernmentActionTypes.UPDATE_UNHANDLED_REPORTS: {
      return {
        ...state,
        unhandledReports: action.unhandledReports,
        unhandledReportsLastUpdated: Date.now()
      }
    }
    case GovernmentActionTypes.UPDATE_ACTIVE_ELECTION: {
      return {
        ...state,
        activeElection: action.activeElection,
        activeElectionLastUpdated: Date.now()
      }
    }
    case GovernmentActionTypes.UPDATE_LOGBOOK_RECENT_ENTRY_TIMESTAMP: {
      return {
        ...state,
        recentLogbookEntryTimestamp: action.timestamp,
        lastNewLogbookCheck: Date.now()
      }
    }
  }

  return state;
};