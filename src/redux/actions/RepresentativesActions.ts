import { ActionCreator } from "redux";
import {
  LoadRepresentativesAction, LoadUnhandledReportsAction,
  RepresentativesActionTypes,
  UpdateRepresentativesAction, UpdateUnhandledReportsAction
} from "../RepresentativeTypes";

export const loadRepresentatives: ActionCreator<LoadRepresentativesAction> = () => ({
  type: RepresentativesActionTypes.LOAD_REPRESENTATIVES
});

export const updateRepresentatives: ActionCreator<UpdateRepresentativesAction> = (representatives: string[]) => ({
  type: RepresentativesActionTypes.UPDATE_REPRESENTATIVES,
  representatives: representatives
});

export const loadUnhandledReports: ActionCreator<LoadUnhandledReportsAction> = () => ({
  type: RepresentativesActionTypes.LOAD_UNHANDLED_REPORTS
});

export const updateUnhandledReports: ActionCreator<UpdateUnhandledReportsAction> = (unhandledReports: number) => ({
  type: RepresentativesActionTypes.UPDATE_UNHANDLED_REPORTS,
  unhandledReports: unhandledReports
});