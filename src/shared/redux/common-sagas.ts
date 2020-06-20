import { put, takeLatest, select, call } from 'redux-saga/effects';
import { updateRateLimited } from './common-actions';
import { CommonActionTypes } from './common-types';
import ApplicationState from '../../core/application-state';

const RATE_LIMIT_DURATION = 30000;
const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

export function* commonWatcher() {
  yield takeLatest(CommonActionTypes.SET_RATE_LIMITED, setRateLimitedSaga);
}

export const isRateLimited = (state: ApplicationState) => state.common.rateLimited;

export function* setRateLimitedSaga() {
  const rateLimited = yield select(isRateLimited);
  if (!rateLimited) {
    yield put(updateRateLimited(true));
    yield call(delay, RATE_LIMIT_DURATION);
    yield put(updateRateLimited(false));
  }
}
