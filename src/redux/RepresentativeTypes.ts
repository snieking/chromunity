export enum RepresentativesActionTypes {
  LOAD_REPRESENTATIVES = "REPRESENTATIVES/LOAD",
  UPDATE_REPRESENTATIVES = "REPRESENTATIVES/UPDATE",
  LOAD_UNHANDLED_REPORTS = "REPRESENTATIVES/UNHANDLED_REPORTS/LOAD",
  UPDATE_UNHANDLED_REPORTS = "REPRESENTATIVES/UNHANDLED_REPORTS/UPDATE"
}

export interface LoadRepresentativesAction {
  type: RepresentativesActionTypes.LOAD_REPRESENTATIVES;
}

export interface UpdateRepresentativesAction {
  type: RepresentativesActionTypes.UPDATE_REPRESENTATIVES;
  representatives: string[];
}

export interface LoadUnhandledReportsAction {
  type: RepresentativesActionTypes.LOAD_UNHANDLED_REPORTS;
}

export interface UpdateUnhandledReportsAction {
  type: RepresentativesActionTypes.UPDATE_UNHANDLED_REPORTS;
  unhandledReports: number;
}

export type RepresentativesActions =
  | LoadRepresentativesAction
  | UpdateRepresentativesAction
  | LoadUnhandledReportsAction
  | UpdateUnhandledReportsAction;

export interface RepresentativesState {
  representatives: string[];
  representativesLastUpdated: number;
  unhandledReports: number;
  unhandledReportsLastUpdated: number;
}
