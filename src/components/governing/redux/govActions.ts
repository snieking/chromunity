import { ActionCreator } from "redux";
import {
  ILoadRepresentatives,
  ILoadUnhandledReports,
  GovernmentActionTypes,
  IUpdateRepresentatives,
  IUpdateUnhandledReports,
  ICheckActiveElection,
  IUpdateActiveElection,
  ICheckNewLogbookEntries,
  IUpdateLogbookRecentEntryTimestamp
} from "./govTypes";
import { ChromunityUser } from "../../../types";

export const loadRepresentatives: ActionCreator<ILoadRepresentatives> = () => ({
  type: GovernmentActionTypes.LOAD_REPRESENTATIVES
});

export const updateRepresentatives: ActionCreator<IUpdateRepresentatives> = (representatives: string[]) => ({
  type: GovernmentActionTypes.UPDATE_REPRESENTATIVES,
  representatives: representatives
});

export const loadUnhandledReports: ActionCreator<ILoadUnhandledReports> = () => ({
  type: GovernmentActionTypes.LOAD_UNHANDLED_REPORTS
});

export const updateUnhandledReports: ActionCreator<IUpdateUnhandledReports> = (unhandledReports: number) => ({
  type: GovernmentActionTypes.UPDATE_UNHANDLED_REPORTS,
  unhandledReports: unhandledReports
});

export const checkNewLogbookEntries: ActionCreator<ICheckNewLogbookEntries> = (user: ChromunityUser) => ({
  type: GovernmentActionTypes.CHECK_LOGBOOK_ENTRIES,
  user
});

export const updateLogbookRecentEntryTimestamp: ActionCreator<IUpdateLogbookRecentEntryTimestamp> = (
  timestamp: number
) => ({
  type: GovernmentActionTypes.UPDATE_LOGBOOK_RECENT_ENTRY_TIMESTAMP,
  timestamp
});

export const checkActiveElection: ActionCreator<ICheckActiveElection> = (user: ChromunityUser) => ({
  type: GovernmentActionTypes.CHECK_ACTIVE_ELECTION,
  user
});

export const updateActiveElection: ActionCreator<IUpdateActiveElection> = (activeElection: boolean) => ({
  type: GovernmentActionTypes.UPDATE_ACTIVE_ELECTION,
  activeElection: activeElection
});