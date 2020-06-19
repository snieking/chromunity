import { createAction } from "@reduxjs/toolkit";
import { SnackbarActionTypes } from "./snackbar-types";
import { withPayloadType } from "../../../shared/redux/util";

export const notifyError = createAction(SnackbarActionTypes.SET_ERROR, withPayloadType<string>());

export const clearError = createAction(SnackbarActionTypes.CLEAR_ERROR);

export const notifySuccess = createAction(SnackbarActionTypes.NOTIFY_SUCCESS, withPayloadType<string>());

export const clearSuccess = createAction(SnackbarActionTypes.CLEAR_SUCCESS);

export const notifyInfo = createAction(SnackbarActionTypes.NOTIFY_INFO, withPayloadType<string>());

export const clearInfo = createAction(SnackbarActionTypes.CLEAR_INFO);
