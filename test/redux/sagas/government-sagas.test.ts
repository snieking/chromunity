import { runSaga } from "redux-saga";
import {
  GovernmentActions,
  GovernmentActionTypes,
  UpdateRepresentativesAction
} from "../../../src/redux/GovernmentTypes";
import {
  checkActiveElection,
  getCurrentRepresentatives,
  retrieveUnhandledReports
} from "../../../src/redux/sagas/GovernmentSagas";
import { CREATE_LOGGED_IN_USER } from "../../users";

describe("Representatives sagas tests", () => {

  jest.setTimeout(30000);

  const createFakeStore = (dispatchedActions: GovernmentActions[], state: any) => {
    return {
      dispatch: (action: GovernmentActions) => dispatchedActions.push(action),
      getState: () => ({ government: state })
    };
  };

  const getUpdateRepresentativesAction = (dispatchedActions: GovernmentActions[]): UpdateRepresentativesAction => {
    expect(dispatchedActions.length).toBe(1);
    const action = dispatchedActions[0];
    expect(action.type).toBe(GovernmentActionTypes.UPDATE_REPRESENTATIVES);
    return action as UpdateRepresentativesAction;
  };

  it("representatives cache not expired yet", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      representativesLastUpdated: Date.now()
    });

    await runSaga(fakeStore, getCurrentRepresentatives).toPromise();
    expect(dispatchedActions.length).toBe(0);
  });

  it("get unhandled topics", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      unhandledReportsLastUpdated: 0
    });

    await runSaga(fakeStore, retrieveUnhandledReports).toPromise();
    expect(dispatchedActions.length).toBe(1);
  });

  it("unhandled topics cache not expired", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      unhandledReportsLastUpdated: Date.now()
    });

    await runSaga(fakeStore, retrieveUnhandledReports).toPromise();
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