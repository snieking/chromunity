import ApplicationState from "./../../../core/application-state";
import { ChromunityUser, Topic } from "./../../../types";
import { put, select, takeLatest } from "redux-saga/effects";
import logger from "../../../shared/util/logger";
import {
  getAllRepresentativeActionsPriorToTimestamp,
  getRepresentatives,
  getReports,
  getPinnedTopicId,
  getPinnedTopicByRep,
  pinTopic,
} from "../../../core/services/RepresentativesService";
import {
  updateActiveElection,
  updateLogbookRecentEntryTimestamp,
  updateReports,
  updateRepresentatives,
  updatePinnedTopic,
  updatePinnedTopicByRep,
  checkActiveElection,
  checkNewLogbookEntries,
  pinTopic as pinTopicAction
} from "./govActions";
import { RepresentativeReport } from "../../../types";
import { GovernmentActionTypes } from "./govTypes";
import { getUncompletedElection, processElection } from "../../../core/services/ElectionService";
import { toLowerCase } from "../../../shared/util/util";
import { setOperationPending } from "../../../shared/redux/CommonActions";
import { getTopicById } from "../../../core/services/TopicService";
import * as config from "../../../config";
import { Action } from "@reduxjs/toolkit";

export function* governmentWatcher() {
  yield takeLatest(GovernmentActionTypes.LOAD_REPRESENTATIVES, getCurrentRepresentativesSaga);
  yield takeLatest(GovernmentActionTypes.LOAD_REPORTS, retrieveReportsSaga);
  yield takeLatest(GovernmentActionTypes.CHECK_ACTIVE_ELECTION, checkActiveElectionSaga);
  yield takeLatest(GovernmentActionTypes.CHECK_LOGBOOK_ENTRIES, checkLogbookEntriesSaga);
  yield takeLatest(GovernmentActionTypes.CHECK_PINNED_TOPIC, checkPinnedTopicSaga);
  yield takeLatest(GovernmentActionTypes.CHECK_PINNED_TOPIC_BY_REP, checkPinnedTopicByRepSaga);
  yield takeLatest(GovernmentActionTypes.PIN_TOPIC, pinTopicSaga);
}

const CACHE_DURATION_MILLIS = 1000 * 60 * 5;

const getRepresentativesLastUpdated = (state: ApplicationState) => state.government.representativesLastUpdated;
const getUnhandledReportsLastUpdated = (state: ApplicationState) => state.government.reportsLastUpdated;
const getActiveElectionLastUpdated = (state: ApplicationState) => state.government.activeElectionLastUpdated;
const getLogbookLastUpdated = (state: ApplicationState) => state.government.lastNewLogbookCheck;
const getRepresentativesCached = (state: ApplicationState) => state.government.representatives;
const pinnedTopic = (state: ApplicationState) => state.government.pinnedTopic;
const getPinnedLastChecked = (state: ApplicationState) => state.government.pinnedTopicLastChecked;
const topicIdPinnedByMe = (state: ApplicationState) => state.government.topicIdPinnedByMe;
const getUser = (state: ApplicationState) => state.account.user;
const representatives = (state: ApplicationState) => state.government.representatives;

const cacheExpired = (updated: number): boolean => {
  return Date.now() - updated > CACHE_DURATION_MILLIS;
};

export function* pinTopicSaga(action: Action) {
  if (pinTopicAction.match(action)) {
    yield put(setOperationPending(true));
    const user: ChromunityUser = yield select(getUser);
    yield pinTopic(user, action.payload);
    yield put(updatePinnedTopicByRep(action.payload));
    yield put(setOperationPending(false));
  }
}

export function* checkPinnedTopicSaga() {
  if (!config.features.pinEnabled) return;

  const topic: Topic = yield select(pinnedTopic);
  const lastChecked: number = yield select(getPinnedLastChecked);
  const user: ChromunityUser = yield select(getUser);

  if (topic == null && cacheExpired(lastChecked)) {
    const topicId = yield getPinnedTopicId(user ? user.name : null);
    if (topicId) {
      const topic = yield getTopicById(topicId, user);
      yield put(updatePinnedTopic(topic));
    }
  }
}

export function* checkPinnedTopicByRepSaga() {
  if (!config.features.pinEnabled) return;

  const user: ChromunityUser = yield select(getUser);
  const topicId: string = yield select(topicIdPinnedByMe);
  const reps: string[] = yield select(representatives);

  if (topicId == null && user && reps && reps.map((n) => toLowerCase(n).includes(toLowerCase(user.name)))) {
    const id = yield getPinnedTopicByRep(user.name);
    yield put(updatePinnedTopicByRep(id ? id : ""));
  }
}

export function* getCurrentRepresentativesSaga() {
  const lastUpdated = yield select(getRepresentativesLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const representatives: string[] = yield getRepresentatives();
    if (representatives != null) {
      yield put(updateRepresentatives(representatives));
    }
  }
}

export function* retrieveReportsSaga() {
  const lastUpdated = yield select(getUnhandledReportsLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const reports: RepresentativeReport[] = yield getReports();
    yield put(updateReports(reports));
  }
}

export function* checkActiveElectionSaga(action: Action) {
  if (checkActiveElection.match(action)) {
    const lastUpdated = yield select(getActiveElectionLastUpdated);

    if (cacheExpired(lastUpdated)) {
      if (action.payload != null) {
        yield processElection(action.payload).catch((error: Error) =>
          logger.debug("Error while processing election, probably expected", error)
        );
      }
      const electionId = yield getUncompletedElection();
      yield put(updateActiveElection(electionId != null));
    }
  }
}

export function* checkLogbookEntriesSaga(action: Action) {
  if (checkNewLogbookEntries.match(action)) {
    const lastRead = yield select(getLogbookLastUpdated);
    const representatives: Array<string> = yield select(getRepresentativesCached);

    if (
      action.payload != null &&
      representatives != null &&
      cacheExpired(lastRead) &&
      representatives.map((rep) => toLowerCase(rep)).includes(toLowerCase(action.payload.name))
    ) {
      const logs = yield getAllRepresentativeActionsPriorToTimestamp(Date.now(), 1);
      yield put(updateLogbookRecentEntryTimestamp(logs.length > 0 ? logs[0].timestamp : Date.now()));
    }
  }
}
