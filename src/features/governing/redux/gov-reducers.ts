import { GovernmentState } from "./gov-types";
import { createReducer } from "@reduxjs/toolkit";
import { updateRepresentatives, updateReports, updateLogbookRecentEntryTimestamp, updateActiveElection, updatePinnedTopic, updatePinnedTopicByRep } from "./gov-actions";

const initialGovernmentState: GovernmentState = {
  representatives: [],
  representativesLastUpdated: 0,
  reports: [],
  reportsLastUpdated: 0,
  activeElection: false,
  activeElectionLastUpdated: 0,
  recentLogbookEntryTimestamp: 0,
  lastNewLogbookCheck: 0,
  pinnedTopic: null,
  pinnedTopicLastChecked: 0,
  topicIdPinnedByMe: null,
};

export const governmentReducer = createReducer(initialGovernmentState, builder =>
  builder
    .addCase(updateRepresentatives, (state, action) => {
      state.representatives = action.payload;
      state.representativesLastUpdated = Date.now();
    })
    .addCase(updateReports, (state, action) => {
      state.reports = action.payload;
    })
    .addCase(updateLogbookRecentEntryTimestamp, (state, action) => {
      state.recentLogbookEntryTimestamp = action.payload;
      state.lastNewLogbookCheck = Date.now();
    })
    .addCase(updateActiveElection, (state, action) => {
      state.activeElection = action.payload;
      state.activeElectionLastUpdated = Date.now();
    })
    .addCase(updatePinnedTopic, (state, action) => {
      state.pinnedTopic = action.payload;
      state.pinnedTopicLastChecked = Date.now();
    })
    .addCase(updatePinnedTopicByRep, (state, action) => {
      state.topicIdPinnedByMe = action.payload;
    })
)
