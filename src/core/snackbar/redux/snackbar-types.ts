export enum SnackbarActionTypes {
  SET_ERROR = 'SNACKBAR/ERROR/SET',
  CLEAR_ERROR = 'SNACKBAR/ERROR/CLEAR',
  NOTIFY_SUCCESS = 'SNACKBAR/SUCCESS/NOTIFY',
  CLEAR_SUCCESS = 'SNACKBAR/SUCCESS/CLEAR',
  NOTIFY_INFO = 'SNACKBAR/INFO/NOTIFY',
  CLEAR_INFO = 'SNACKBAR/INFO/CLEAR',
}

export interface SnackbarState {
  error: boolean;
  errorMsg: string;
  info: boolean;
  infoMsg: string;
  success: boolean;
  successMsg: string;
}
