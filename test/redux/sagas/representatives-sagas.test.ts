import { runSaga } from "redux-saga";
import {
  RepresentativesActions,
  RepresentativesActionTypes,
  UpdateRepresentativesAction
} from "../../../src/redux/RepresentativeTypes";
import { getCurrentRepresentatives, retrieveUnhandledReports } from "../../../src/redux/sagas/RepresentativesSagas";

describe("Representatives sagas tests", () => {

  jest.setTimeout(30000);

  const createFakeStore = (dispatchedActions: RepresentativesActions[], state: any) => {
    return {
      dispatch: (action: RepresentativesActions) => dispatchedActions.push(action),
      getState: () => ({ representatives: state })
    };
  };

  const getUpdateRepresentativesAction = (dispatchedActions: RepresentativesActions[]): UpdateRepresentativesAction => {
    expect(dispatchedActions.length).toBe(1);
    const action = dispatchedActions[0];
    expect(action.type).toBe(RepresentativesActionTypes.UPDATE_REPRESENTATIVES);
    return action as UpdateRepresentativesAction;
  };

  it("admin is representative", async () => {
    const dispatchedActions: RepresentativesActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      representativesLastUpdated: 0
    });

    await runSaga(fakeStore, getCurrentRepresentatives).toPromise();
    const action = getUpdateRepresentativesAction(dispatchedActions);

    expect(action.representatives).toContain("admin");
  });

  it("representatives cache not expired yet", async () => {
    const dispatchedActions: RepresentativesActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      representativesLastUpdated: Date.now()
    });

    await runSaga(fakeStore, getCurrentRepresentatives).toPromise();
    expect(dispatchedActions.length).toBe(0);
  });

  it("get unhandled topics", async () => {
    const dispatchedActions: RepresentativesActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      unhandledReportsLastUpdated: 0
    });

    await runSaga(fakeStore, retrieveUnhandledReports).toPromise();
    expect(dispatchedActions.length).toBe(1);
  });

  it("unhandled topics cache not expired", async () => {
    const dispatchedActions: RepresentativesActions[] = [];
    const fakeStore = createFakeStore(dispatchedActions, {
      unhandledReportsLastUpdated: Date.now()
    });

    await runSaga(fakeStore, retrieveUnhandledReports).toPromise();
    expect(dispatchedActions.length).toBe(0);
  });

});