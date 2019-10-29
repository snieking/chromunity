export enum GovernmentActionTypes {
  LOAD_REPRESENTATIVES = "GOVERNMENT/REPRESENTATIVES/LOAD",
  UPDATE_REPRESENTATIVES = "GOVERNMENT/REPRESENTATIVES/UPDATE",
  LOAD_UNHANDLED_REPORTS = "GOVERNMENT/REPRESENTATIVE/UNHANDLED_REPORTS/LOAD",
  UPDATE_UNHANDLED_REPORTS = "GOVERNMENT/REPRESENTATIVES/UNHANDLED_REPORTS/UPDATE",
  CHECK_ACTIVE_ELECTION = "GOVERNMENT/ACTIVE_ELECTION/CHECK",
  UPDATE_ACTIVE_ELECTION = "GOVERNMENT/ACTIVE_ELECTION/UPDATE"
}

export interface LoadRepresentativesAction {
  type: GovernmentActionTypes.LOAD_REPRESENTATIVES;
}

export interface UpdateRepresentativesAction {
  type: GovernmentActionTypes.UPDATE_REPRESENTATIVES;
  representatives: string[];
}

export interface LoadUnhandledReportsAction {
  type: GovernmentActionTypes.LOAD_UNHANDLED_REPORTS;
}

export interface UpdateUnhandledReportsAction {
  type: GovernmentActionTypes.UPDATE_UNHANDLED_REPORTS;
  unhandledReports: number;
}

export interface CheckActiveElectionAction {
  type: GovernmentActionTypes.CHECK_ACTIVE_ELECTION;
}

export interface UpdateActiveElectionAction {
  type: GovernmentActionTypes.UPDATE_ACTIVE_ELECTION;
  activeElection: boolean;
}

export type GovernmentActions =
  | LoadRepresentativesAction
  | UpdateRepresentativesAction
  | LoadUnhandledReportsAction
  | UpdateUnhandledReportsAction
  | CheckActiveElectionAction
  | UpdateActiveElectionAction;

export interface GovernmentState {
  representatives: string[];
  representativesLastUpdated: number;
  unhandledReports: number;
  unhandledReportsLastUpdated: number;
  activeElection: boolean;
  activeElectionLastUpdated: number;
}
