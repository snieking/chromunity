import { ActionCreator } from "redux";
import {
  LoadRepresentativesAction,
  LoadUnhandledReportsAction,
  GovernmentActionTypes,
  UpdateRepresentativesAction,
  UpdateUnhandledReportsAction,
  CheckActiveElectionAction,
  UpdateActiveElectionAction,
  CheckNewLogbookEntriesAction,
  UpdateLogbookRecentEntryTimestampAction
} from "../GovernmentTypes";
import { ChromunityUser } from "../../types";

export const loadRepresentatives: ActionCreator<LoadRepresentativesAction> = () => ({
  type: GovernmentActionTypes.LOAD_REPRESENTATIVES
});

export const updateRepresentatives: ActionCreator<UpdateRepresentativesAction> = (representatives: string[]) => ({
  type: GovernmentActionTypes.UPDATE_REPRESENTATIVES,
  representatives: representatives
});

export const loadUnhandledReports: ActionCreator<LoadUnhandledReportsAction> = () => ({
  type: GovernmentActionTypes.LOAD_UNHANDLED_REPORTS
});

export const updateUnhandledReports: ActionCreator<UpdateUnhandledReportsAction> = (unhandledReports: number) => ({
  type: GovernmentActionTypes.UPDATE_UNHANDLED_REPORTS,
  unhandledReports: unhandledReports
});

export const checkNewLogbookEntries: ActionCreator<CheckNewLogbookEntriesAction> = (user: ChromunityUser) => ({
  type: GovernmentActionTypes.CHECK_LOGBOOK_ENTRIES,
  user
});

export const updateLogbookRecentEntryTimestamp: ActionCreator<UpdateLogbookRecentEntryTimestampAction> = (
  timestamp: number
) => ({
  type: GovernmentActionTypes.UPDATE_LOGBOOK_RECENT_ENTRY_TIMESTAMP,
  timestamp
});

export const checkActiveElection: ActionCreator<CheckActiveElectionAction> = (user: ChromunityUser) => ({
  type: GovernmentActionTypes.CHECK_ACTIVE_ELECTION,
  user
});

export const updateActiveElection: ActionCreator<UpdateActiveElectionAction> = (activeElection: boolean) => ({
  type: GovernmentActionTypes.UPDATE_ACTIVE_ELECTION,
  activeElection: activeElection
});
