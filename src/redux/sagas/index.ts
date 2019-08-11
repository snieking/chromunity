import { all } from "redux-saga/effects";
import {accountWatcher} from "./AccountSagas";

export default function* rootSaga() {
  yield all([
    accountWatcher()
  ]);
}