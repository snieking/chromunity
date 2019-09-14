import { RepresentativesActionTypes } from "../RepresentativeTypes";
import { put, select, takeLatest } from "redux-saga/effects";
import { ApplicationState } from "../Store";
import { getRepresentatives, getUnhandledReports } from "../../blockchain/RepresentativesService";
import { RepresentativeReport } from "../../types";
import { updateRepresentatives, updateUnhandledReports } from "../actions/RepresentativesActions";

export function* representativesWatcher() {
  yield takeLatest(RepresentativesActionTypes.LOAD_REPRESENTATIVES, getCurrentRepresentatives);
  yield takeLatest(RepresentativesActionTypes.LOAD_UNHANDLED_REPORTS, retrieveUnhandledReports);
}

const CACHE_DURATION_MILLIS = 1000 * 60 * 5;

const getRepresentativesLastUpdated = (state: ApplicationState) => state.representatives.representativesLastUpdated;
const getUnhandledReportsLastUpdated = (state: ApplicationState) => state.representatives.unhandledReportsLastUpdated;

const cacheExpired = (updated: number): boolean => {
  return Date.now() - updated > CACHE_DURATION_MILLIS;
};

export function* getCurrentRepresentatives() {
  const lastUpdated = yield select(getRepresentativesLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const representatives: string[] = yield getRepresentatives();
    yield put(updateRepresentatives(representatives));
  }

}

export function* retrieveUnhandledReports() {
  const lastUpdated = yield select(getUnhandledReportsLastUpdated);

  if (cacheExpired(lastUpdated)) {
    const reports: RepresentativeReport[] = yield getUnhandledReports();
    yield put(updateUnhandledReports(reports.length));
  }
}