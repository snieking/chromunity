import { CheckActiveElectionAction, CheckNewLogbookEntriesAction, GovernmentActionTypes } from "../GovernmentTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import { ApplicationState } from "../Store";
import {
  getAllRepresentativeActionsPriorToTimestamp, getRepresentatives,
  getUnhandledReports
} from "../../blockchain/RepresentativesService";
import { RepresentativeReport } from "../../types";
import {
  updateActiveElection,
  updateLogbookRecentEntryTimestamp,
  updateRepresentatives,
  updateUnhandledReports
} from "../actions/GovernmentActions";
import { getUncompletedElection, processElection } from "../../blockchain/ElectionService";
import { toLowerCase } from "../../util/util";
import logger from "../../util/logger";

export function* governmentWatcher() {
  yield takeLatest(GovernmentActionTypes.LOAD_REPRESENTATIVES, getCurrentRepresentatives);
  yield takeLatest(GovernmentActionTypes.LOAD_UNHANDLED_REPORTS, retrieveUnhandledReports);
  yield takeLatest(GovernmentActionTypes.CHECK_ACTIVE_ELECTION, checkActiveElection);
  yield takeLatest(GovernmentActionTypes.CHECK_LOGBOOK_ENTRIES, checkLogbookEntries);
}

const CACHE_DURATION_MILLIS = 1000 * 60 * 5;

const getRepresentativesLastUpdated = (state: ApplicationState) => state.government.representativesLastUpdated;
const getUnhandledReportsLastUpdated = (state: ApplicationState) => state.government.unhandledReportsLastUpdated;
const getActiveElectionLastUpdated = (state: ApplicationState) => state.government.activeElectionLastUpdated;
const getLogbookLastUpdated = (state: ApplicationState) => state.government.lastNewLogbookCheck;
const getRepresentativesCached = (state: ApplicationState) => state.government.representatives;

const cacheExpired = (updated: number): boolean => {
  return Date.now() - updated > CACHE_DURATION_MILLIS;
};

export function* getCurrentRepresentatives() {
  const lastUpdated = yield select(getRepresentativesLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const representatives: string[] = yield getRepresentatives();
    if (representatives != null) {
      yield put(updateRepresentatives(representatives));
    }
  }

}

export function* retrieveUnhandledReports() {
  const lastUpdated = yield select(getUnhandledReportsLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const reports: RepresentativeReport[] = yield getUnhandledReports();
    yield put(updateUnhandledReports(reports.length));
  }
}

export function* checkActiveElection(action: CheckActiveElectionAction) {
  const lastUpdated = yield select(getActiveElectionLastUpdated);

  if (cacheExpired(lastUpdated)) {
    if (action.user != null) {
      yield processElection(action.user)
        .catch(error => logger.debug("Error while processing election, probably expected", error));
    }
    const electionId = yield getUncompletedElection();
    yield put(updateActiveElection(electionId != null));
  }
}

export function* checkLogbookEntries(action: CheckNewLogbookEntriesAction) {
  const lastRead = yield select(getLogbookLastUpdated);
  const representatives: Array<string> = yield select(getRepresentativesCached);

  if (action.user != null && representatives != null && cacheExpired(lastRead)
    && representatives.map(rep => toLowerCase(rep)).includes(toLowerCase(action.user.name))) {
    const logs = yield getAllRepresentativeActionsPriorToTimestamp(Date.now(), 1);
    yield put(updateLogbookRecentEntryTimestamp(logs.length > 0 ? logs[0].timestamp : Date.now()));
  }
}