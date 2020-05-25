import { ActionCreator } from "redux";
import {
  ILoadRepresentatives,
  ILoadReports,
  GovernmentActionTypes,
  IUpdateRepresentatives,
  IUpdateReports,
  ICheckActiveElection,
  IUpdateActiveElection,
  ICheckNewLogbookEntries,
  IUpdateLogbookRecentEntryTimestamp,
  ICheckPinnedTopic,
  IUpdatePinnedTopic,
  ICheckPinnedTopicByRep,
  IUpdatePinnedTopicByRep,
  IPinTopic
} from "./govTypes";
import { ChromunityUser, RepresentativeReport, Topic } from "../../../types";

export const loadRepresentatives: ActionCreator<ILoadRepresentatives> = () => ({
  type: GovernmentActionTypes.LOAD_REPRESENTATIVES
});

export const updateRepresentatives: ActionCreator<IUpdateRepresentatives> = (representatives: string[]) => ({
  type: GovernmentActionTypes.UPDATE_REPRESENTATIVES,
  representatives: representatives
});

export const loadReports: ActionCreator<ILoadReports> = () => ({
  type: GovernmentActionTypes.LOAD_REPORTS
});

export const updateReports: ActionCreator<IUpdateReports> = (reports: RepresentativeReport[]) => ({
  type: GovernmentActionTypes.UPDATE_REPORTS,
  reports
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

export const checkPinnedTopic: ActionCreator<ICheckPinnedTopic> = () => ({
  type: GovernmentActionTypes.CHECK_PINNED_TOPIC
});

export const updatePinnedTopic: ActionCreator<IUpdatePinnedTopic> = (topic: Topic) => ({
  type: GovernmentActionTypes.UPDATE_PINNED_TOPIC,
  topic
});

export const pinTopic: ActionCreator<IPinTopic> = (topicId: string) => ({
  type: GovernmentActionTypes.PIN_TOPIC,
  topicId
})

export const checkPinnedTopicByRep: ActionCreator<ICheckPinnedTopicByRep> = () => ({
  type: GovernmentActionTypes.CHECK_PINNED_TOPIC_BY_REP
});

export const updatePinnedTopicByRep: ActionCreator<IUpdatePinnedTopicByRep> = (topicId: string) => ({
  type: GovernmentActionTypes.UPDATE_PINNED_TOPIC_BY_REP,
  topicId
});
