import { ActionCreator } from "redux";

export enum SnackbarActionTypes {
  SET_ERROR = "SNACKBAR/ERROR/SET",
  CLEAR_ERROR = "SNACKBAR/ERROR/CLEAR",
  NOTIFY_SUCCESS = "SNACKBAR/SUCCESS/NOTIFY",
  CLEAR_SUCCESS = "SNACKBAR/SUCCESS/CLEAR",
  NOTIFY_INFO = "SNACKBAR/INFO/NOTIFY",
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

export interface INotifySuccess {
  type: SnackbarActionTypes.NOTIFY_SUCCESS;
  msg: string;
}

export const notifySuccess: ActionCreator<INotifySuccess> = (msg: string) => ({
  type: SnackbarActionTypes.NOTIFY_SUCCESS,
  msg,
});

export interface IClearSuccess {
  type: SnackbarActionTypes.CLEAR_SUCCESS;
}

export const clearSuccess: ActionCreator<IClearSuccess> = () => ({
  type: SnackbarActionTypes.CLEAR_SUCCESS,
});

export interface INotifyInfo {
  type: SnackbarActionTypes.NOTIFY_INFO;
  msg: string;
}

export const notifyInfo: ActionCreator<INotifyInfo> = (msg: string) => ({
  type: SnackbarActionTypes.NOTIFY_INFO,
  msg,
});

export interface IClearInfo {
  type: SnackbarActionTypes.CLEAR_INFO;
}

export const clearInfo: ActionCreator<IClearInfo> = () => ({
  type: SnackbarActionTypes.CLEAR_INFO,
});

export type SnackbarActions = ISetError | IClearError | INotifySuccess | IClearSuccess | INotifyInfo | IClearInfo;

export interface SnackbarState {
  error: boolean;
  errorMsg: string;
  info: boolean;
  infoMsg: string;
  success: boolean;
  successMsg: string;
}
