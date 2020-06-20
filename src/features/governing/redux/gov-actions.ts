import { createAction } from '@reduxjs/toolkit';
import { GovernmentActionTypes } from './gov-types';
import { ChromunityUser, RepresentativeReport, Topic } from '../../../types';
import { withPayloadType } from '../../../shared/redux/util';

export const loadRepresentatives = createAction(GovernmentActionTypes.LOAD_REPRESENTATIVES);

export const updateRepresentatives = createAction(
  GovernmentActionTypes.UPDATE_REPRESENTATIVES,
  withPayloadType<string[]>()
);

export const loadReports = createAction(GovernmentActionTypes.LOAD_REPORTS);

export const updateReports = createAction(
  GovernmentActionTypes.UPDATE_REPORTS,
  withPayloadType<RepresentativeReport[]>()
);

export const checkNewLogbookEntries = createAction(
  GovernmentActionTypes.CHECK_LOGBOOK_ENTRIES,
  withPayloadType<ChromunityUser>()
);

export const updateLogbookRecentEntryTimestamp = createAction(
  GovernmentActionTypes.UPDATE_LOGBOOK_RECENT_ENTRY_TIMESTAMP,
  withPayloadType<number>()
);

export const checkActiveElection = createAction(
  GovernmentActionTypes.CHECK_ACTIVE_ELECTION,
  withPayloadType<ChromunityUser>()
);

export const updateActiveElection = createAction(
  GovernmentActionTypes.UPDATE_ACTIVE_ELECTION,
  withPayloadType<boolean>()
);

export const checkPinnedTopic = createAction(GovernmentActionTypes.CHECK_PINNED_TOPIC);

export const updatePinnedTopic = createAction(GovernmentActionTypes.UPDATE_PINNED_TOPIC, withPayloadType<Topic>());

export const pinTopic = createAction(GovernmentActionTypes.PIN_TOPIC, withPayloadType<string>());

export const checkPinnedTopicByRep = createAction(GovernmentActionTypes.CHECK_PINNED_TOPIC_BY_REP);

export const updatePinnedTopicByRep = createAction(
  GovernmentActionTypes.UPDATE_PINNED_TOPIC_BY_REP,
  withPayloadType<string>()
);
