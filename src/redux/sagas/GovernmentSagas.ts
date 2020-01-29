import { CheckActiveElectionAction, GovernmentActionTypes } from "../GovernmentTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import { ApplicationState } from "../Store";
import { getRepresentatives, getUnhandledReports } from "../../blockchain/RepresentativesService";
import { RepresentativeReport } from "../../types";
import { updateActiveElection, updateRepresentatives, updateUnhandledReports } from "../actions/GovernmentActions";
import { getUncompletedElection, processElection } from "../../blockchain/ElectionService";

export function* governmentWatcher() {
  yield takeLatest(GovernmentActionTypes.LOAD_REPRESENTATIVES, getCurrentRepresentatives);
  yield takeLatest(GovernmentActionTypes.LOAD_UNHANDLED_REPORTS, retrieveUnhandledReports);
  yield takeLatest(GovernmentActionTypes.CHECK_ACTIVE_ELECTION, checkActiveElection);
}

const CACHE_DURATION_MILLIS = 1000 * 60 * 5;

const getRepresentativesLastUpdated = (state: ApplicationState) => state.government.representativesLastUpdated;
const getUnhandledReportsLastUpdated = (state: ApplicationState) => state.government.unhandledReportsLastUpdated;
const getActiveElectionLastUpdated = (state: ApplicationState) => state.government.activeElectionLastUpdated;

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
      yield processElection(action.user).catch(error => console.log(error));
    }
    const electionId = yield getUncompletedElection();
    yield put(updateActiveElection(electionId != null));
  }
}