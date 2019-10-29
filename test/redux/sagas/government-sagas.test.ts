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

  it("admin is representative", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      representativesLastUpdated: 0
    });

    await runSaga(fakeStore, getCurrentRepresentatives).toPromise();
    const action = getUpdateRepresentativesAction(dispatchedActions);

    expect(action.representatives).toContain("admin");
  });

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

    await runSaga(fakeStore, checkActiveElection).toPromise();
    expect(dispatchedActions.length).toBe(1);
  });

  it("active election cache not expired", async () => {
    const dispatchedActions: GovernmentActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      activeElectionLastUpdated: Date.now()
    });

    await runSaga(fakeStore, checkActiveElection).toPromise();
    expect(dispatchedActions.length).toBe(0);
  });

});