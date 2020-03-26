import { runSaga } from "redux-saga";

import {
  checkActiveElection,
  getCurrentRepresentatives,
  retrieveReports
} from "../../../src/components/governing/redux/govSagas";
import { CREATE_LOGGED_IN_USER } from "../../users";
import { GovernmentActions, GovernmentActionTypes } from "../../../src/components/governing/redux/govTypes";

describe("Representatives sagas tests", () => {

  jest.setTimeout(30000);

  const createFakeStore = (dispatchedActions: GovernmentActions[], state: any) => {
    return {
      dispatch: (action: GovernmentActions) => dispatchedActions.push(action),
      getState: () => ({ government: state })
    };
  };

  it("representatives cache not expired yet", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      representativesLastUpdated: Date.now()
    });

    await runSaga(fakeStore, getCurrentRepresentatives).toPromise();
    expect(dispatchedActions.length).toBe(0);
  });

  it("unhandled topics cache not expired", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      unhandledReportsLastUpdated: Date.now()
    });

    await runSaga(fakeStore, retrieveReports).toPromise();
    expect(dispatchedActions.length).toBe(0);
  });

  it("get active election", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      activeElectionLastUpdated: 0
    });

    const user = await CREATE_LOGGED_IN_USER();

    await runSaga(fakeStore, checkActiveElection, { type: GovernmentActionTypes.CHECK_ACTIVE_ELECTION, user }).toPromise();
    expect(dispatchedActions.length).toBe(1);
  });

  it("active election cache not expired", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      activeElectionLastUpdated: Date.now()
    });

    const user = await CREATE_LOGGED_IN_USER();

    await runSaga(fakeStore, checkActiveElection, { type: GovernmentActionTypes.CHECK_ACTIVE_ELECTION, user }).toPromise();
    expect(dispatchedActions.length).toBe(0);
  });

});