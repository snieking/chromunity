import { ActionCreator } from "redux";

export enum SnackbarActionTypes {
  SET_ERROR = "SNACKBAR/ERROR/SET",
  CLEAR_ERROR = "SNACKBAR/ERROR/CLEAR",
  SET_INFO = "SNACKBAR/INFO/SET",
  CLEAR_INFO = "SNACKBAR/INFO/CLEAR",
}

export interface ISetError {
  type: SnackbarActionTypes.SET_ERROR;
  msg: string;
}

export const setError: ActionCreator<ISetError> = (msg: string) => ({
  type: SnackbarActionTypes.SET_ERROR,
  msg,
});

export interface IClearError {
  type: SnackbarActionTypes.CLEAR_ERROR;
}

export const clearError: ActionCreator<IClearError> = () => ({
  type: SnackbarActionTypes.CLEAR_ERROR,
});

export interface ISetInfo {
  type: SnackbarActionTypes.SET_INFO;
  msg: string;
}

export const setInfo: ActionCreator<ISetInfo> = (msg: string) => ({
  type: SnackbarActionTypes.SET_INFO,
  msg,
});

export interface IClearInfo {
  type: SnackbarActionTypes.CLEAR_INFO;
}

export const clearInfo: ActionCreator<IClearInfo> = () => ({
  type: SnackbarActionTypes.CLEAR_INFO,
});

export type SnackbarActions = ISetError | IClearError | ISetInfo | IClearInfo;

export interface SnackbarState {
  error: boolean;
  errorMsg: string;
  info: boolean;
  infoMsg: string;
}
