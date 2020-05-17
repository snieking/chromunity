import { ApplicationState } from "./../../../core/store";
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
} from "./govActions";
import { RepresentativeReport } from "../../../types";
import { ICheckActiveElection, ICheckNewLogbookEntries, GovernmentActionTypes, IPinTopic } from "./govTypes";
import { getUncompletedElection, processElection } from "../../../core/services/ElectionService";
import { toLowerCase } from "../../../shared/util/util";
import { setOperationPending } from "../../../shared/redux/CommonActions";
import { getTopicById } from "../../../core/services/TopicService";
import * as config from "../../../config";

export function* governmentWatcher() {
  yield takeLatest(GovernmentActionTypes.LOAD_REPRESENTATIVES, getCurrentRepresentatives);
  yield takeLatest(GovernmentActionTypes.LOAD_REPORTS, retrieveReports);
  yield takeLatest(GovernmentActionTypes.CHECK_ACTIVE_ELECTION, checkActiveElection);
  yield takeLatest(GovernmentActionTypes.CHECK_LOGBOOK_ENTRIES, checkLogbookEntries);
  yield takeLatest(GovernmentActionTypes.CHECK_PINNED_TOPIC, checkPinnedTopic);
  yield takeLatest(GovernmentActionTypes.CHECK_PINNED_TOPIC_BY_REP, checkPinnedTopicByRep);
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

export function* pinTopicSaga(action: IPinTopic) {
  yield put(setOperationPending(true));
  const user: ChromunityUser = yield select(getUser);
  yield pinTopic(user, action.topicId);
  yield put(updatePinnedTopicByRep(action.topicId));
  yield put(setOperationPending(false));
}

export function* checkPinnedTopic() {
  if (config.features.pinEnabled) return;

  logger.silly("[SAGA - STARTED]: Checked pinned topic");

  const topic: Topic = yield select(pinnedTopic);
  const lastChecked: number = yield select(getPinnedLastChecked);
  const user: ChromunityUser = yield select(getUser);

  if (topic == null && cacheExpired(lastChecked)) {
    const topicId = yield getPinnedTopicId(user ? user.name : null);
    const topic = yield getTopicById(topicId, user);
    yield put(updatePinnedTopic(topic));
  }

  logger.silly("[SAGA - FINISHED]: Checked pinned topic");
}

export function* checkPinnedTopicByRep() {
  if (config.features.pinEnabled) return;

  logger.silly("[SAGA - STARTED]: Checked pinned topic by rep");

  const user: ChromunityUser = yield select(getUser);
  const topicId: string = yield select(topicIdPinnedByMe);
  const reps: string[] = yield select(representatives);

  if (topicId == null && user && reps && reps.map((n) => toLowerCase(n).includes(toLowerCase(user.name)))) {
    const id = yield getPinnedTopicByRep(user.name);
    yield put(updatePinnedTopicByRep(id ? id : ""));
  }

  logger.silly("[SAGA - FINISHED]: Checked pinned topic by rep");
}

export function* getCurrentRepresentatives() {
  logger.silly("[SAGA - STARTED]: Get current representatives");
  const lastUpdated = yield select(getRepresentativesLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const representatives: string[] = yield getRepresentatives();
    if (representatives != null) {
      yield put(updateRepresentatives(representatives));
    }
  }

  logger.silly("[SAGA - FINISHED]: Get current representatives");
}

export function* retrieveReports() {
  logger.silly("[SAGA - STARTED]: Retrieving unhandled reports");
  const lastUpdated = yield select(getUnhandledReportsLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const reports: RepresentativeReport[] = yield getReports();
    yield put(updateReports(reports));
  }

  logger.silly("[SAGA - FINISHED]: Retrieving unhandled reports");
}

export function* checkActiveElection(action: ICheckActiveElection) {
  logger.silly("[SAGA - STARTED]: Checking active election");
  const lastUpdated = yield select(getActiveElectionLastUpdated);

  if (cacheExpired(lastUpdated)) {
    if (action.user != null) {
      yield processElection(action.user).catch((error: Error) =>
        logger.debug("Error while processing election, probably expected", error)
      );
    }
    const electionId = yield getUncompletedElection();
    yield put(updateActiveElection(electionId != null));
  }

  logger.silly("[SAGA - FINISHED]: Checking active election");
}

export function* checkLogbookEntries(action: ICheckNewLogbookEntries) {
  logger.silly("[SAGA - STARTED]: Checking logbook entries", action);
  const lastRead = yield select(getLogbookLastUpdated);
  const representatives: Array<string> = yield select(getRepresentativesCached);

  if (
    action.user != null &&
    representatives != null &&
    cacheExpired(lastRead) &&
    representatives.map((rep) => toLowerCase(rep)).includes(toLowerCase(action.user.name))
  ) {
    const logs = yield getAllRepresentativeActionsPriorToTimestamp(Date.now(), 1);
    yield put(updateLogbookRecentEntryTimestamp(logs.length > 0 ? logs[0].timestamp : Date.now()));
  }

  logger.silly("[SAGA - FINISHED]: Checking logbook entries");
}
