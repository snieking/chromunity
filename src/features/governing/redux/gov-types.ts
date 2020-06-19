import { RepresentativeReport, Topic } from "../../../types";

export enum GovernmentActionTypes {
  LOAD_REPRESENTATIVES = "GOVERNMENT/REPRESENTATIVES/LOAD",
  UPDATE_REPRESENTATIVES = "GOVERNMENT/REPRESENTATIVES/UPDATE",
  LOAD_REPORTS = "GOVERNMENT/REPRESENTATIVE/UNHANDLED_REPORTS/LOAD",
  UPDATE_REPORTS = "GOVERNMENT/REPRESENTATIVES/REPORTS/UPDATE",
  CHECK_ACTIVE_ELECTION = "GOVERNMENT/ACTIVE_ELECTION/CHECK",
  UPDATE_ACTIVE_ELECTION = "GOVERNMENT/ACTIVE_ELECTION/UPDATE",
  CHECK_LOGBOOK_ENTRIES = "GOVERNMENT/LOGBOOK/CHECK",
  UPDATE_LOGBOOK_RECENT_ENTRY_TIMESTAMP = "GOVERNMENT/LOGBOOK/RECENT_ENTRY_TIMESTAMP",
  CHECK_PINNED_TOPIC = "GOVERNMENT/PINNED_TOPIC/CHECK",
  UPDATE_PINNED_TOPIC = "GOVERNMENT/PINNED_TOPIC/UPDATE",
  CHECK_PINNED_TOPIC_BY_REP = "GOVERNMENT/PINNED_TOPIC_BY_REP/CHECK",
  UPDATE_PINNED_TOPIC_BY_REP = "GOVERNMENT/PINNED_TOPIC_BY_REP/UPDATE",
  PIN_TOPIC = "GOVERNMENT/PIN_TOPIC"
}

// export type GovernmentActions =
//   | ILoadRepresentatives
//   | IUpdateRepresentatives
//   | ILoadReports
//   | IUpdateReports
//   | ICheckActiveElection
//   | IUpdateActiveElection
//   | ICheckNewLogbookEntries
//   | IUpdateLogbookRecentEntryTimestamp
//   | ICheckPinnedTopic
//   | IUpdatePinnedTopic
//   | ICheckPinnedTopicByRep
//   | IUpdatePinnedTopicByRep
//   | IPinTopic;

export interface GovernmentState {
  representatives: string[];
  representativesLastUpdated: number;
  reports: RepresentativeReport[];
  reportsLastUpdated: number;
  activeElection: boolean;
  activeElectionLastUpdated: number;
  recentLogbookEntryTimestamp: number;
  lastNewLogbookCheck: number;
  pinnedTopic: Topic;
  pinnedTopicLastChecked: number;
  topicIdPinnedByMe: string;
}
