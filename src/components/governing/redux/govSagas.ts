import { put, select, takeLatest } from "redux-saga/effects";
import { ApplicationState } from "../../../store";
import logger from "../../../util/logger";
import {
  getAllRepresentativeActionsPriorToTimestamp,
  getRepresentatives,
  getReports
} from "../../../blockchain/RepresentativesService";
import {
  updateActiveElection,
  updateLogbookRecentEntryTimestamp, updateReports,
  updateRepresentatives
} from "./govActions";
import { RepresentativeReport } from "../../../types";
import { ICheckActiveElection, ICheckNewLogbookEntries, GovernmentActionTypes } from "./govTypes";
import { getUncompletedElection, processElection } from "../../../blockchain/ElectionService";
import { toLowerCase } from "../../../util/util";

export function* governmentWatcher() {
  yield takeLatest(GovernmentActionTypes.LOAD_REPRESENTATIVES, getCurrentRepresentatives);
  yield takeLatest(GovernmentActionTypes.LOAD_REPORTS, retrieveReports);
  yield takeLatest(GovernmentActionTypes.CHECK_ACTIVE_ELECTION, checkActiveElection);
  yield takeLatest(GovernmentActionTypes.CHECK_LOGBOOK_ENTRIES, checkLogbookEntries);
}

const CACHE_DURATION_MILLIS = 1000 * 60 * 5;

const getRepresentativesLastUpdated = (state: ApplicationState) => state.government.representativesLastUpdated;
const getUnhandledReportsLastUpdated = (state: ApplicationState) => state.government.reportsLastUpdated;
const getActiveElectionLastUpdated = (state: ApplicationState) => state.government.activeElectionLastUpdated;
const getLogbookLastUpdated = (state: ApplicationState) => state.government.lastNewLogbookCheck;
const getRepresentativesCached = (state: ApplicationState) => state.government.representatives;

const cacheExpired = (updated: number): boolean => {
  return Date.now() - updated > CACHE_DURATION_MILLIS;
};

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
      yield processElection(action.user)
        .catch((error: Error) => logger.debug("Error while processing election, probably expected", error));
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

  if (action.user != null && representatives != null && cacheExpired(lastRead)
    && representatives.map(rep => toLowerCase(rep)).includes(toLowerCase(action.user.name))) {
    const logs = yield getAllRepresentativeActionsPriorToTimestamp(Date.now(), 1);
    yield put(updateLogbookRecentEntryTimestamp(logs.length > 0 ? logs[0].timestamp : Date.now()));
  }

  logger.silly("[SAGA - FINISHED]: Checking logbook entries");
}