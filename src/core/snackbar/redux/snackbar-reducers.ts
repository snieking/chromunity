import { SnackbarState } from './snackbar-types';
import { createReducer } from '@reduxjs/toolkit';
import { notifyError, clearError, notifySuccess, clearSuccess, notifyInfo, clearInfo } from './snackbar-actions';

const initialSnackbarState: SnackbarState = {
  error: false,
  errorMsg: null,
  info: false,
  infoMsg: null,
  success: false,
  successMsg: null
};

export const snackbarReducer = createReducer(initialSnackbarState, builder =>
  builder
    .addCase(notifyError, (state, action) => {
      state.errorMsg = action.payload;
      state.error = true;
    })
    .addCase(clearError, (state, _) => {
      state.error = false;
      state.errorMsg = null;
    })
    .addCase(notifySuccess, (state, action) => {
      state.successMsg = action.payload;
      state.success = true;
    })
    .addCase(clearSuccess, (state, _) => {
      state.success = false;
      state.successMsg = null;
    })
    .addCase(notifyInfo, (state, action) => {
      state.infoMsg = action.payload;
      state.info = true;
    })
    .addCase(clearInfo, (state, _) => {
      state.info = false;
      state.infoMsg = null;
    })
)
