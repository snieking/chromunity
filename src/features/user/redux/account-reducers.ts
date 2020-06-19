import { AccountState, AuthenticationStep } from "./account-types";
import { createReducer } from "@reduxjs/toolkit";
import { vaultCancel, setUser, saveVaultAccount, setAuthenticationStep, autoLogin, autoLoginAttempted, storeDistrustedUsers, storeUserKudos } from "./account-actions";

const initialAccountState: AccountState = {
  authenticationStep: null,
  accountId: null,
  ft3User: null,
  user: null,
  distrustedUsers: [],
  autoLoginInProgress: true,
  kudos: 0,
};

function getCancellationStep(step: AuthenticationStep): AuthenticationStep {
  switch (step) {
    case AuthenticationStep.REGISTERING_USER:
      return AuthenticationStep.USERNAME_INPUT_REQUIRED;
    default:
      return null;
  }
}

export const loginReducer = createReducer(initialAccountState, builder =>
  builder
    .addCase(vaultCancel, (state, _) => {
      state.authenticationStep = getCancellationStep(state.authenticationStep);
    })
    .addCase(setUser, (state, action) => {
      state.user = action.payload;
    })
    .addCase(saveVaultAccount, (state, action) => {
      state.accountId = action.payload.accountId;
      state.ft3User = action.payload.ft3User;
    })
    .addCase(setAuthenticationStep, (state, action) => {
      state.authenticationStep = action.payload;
    })
    .addCase(autoLogin, (state, _) => {
      state.autoLoginInProgress = true;
    })
    .addCase(autoLoginAttempted, (state, _) => {
      state.autoLoginInProgress = false;
    })
    .addCase(storeDistrustedUsers, (state, action) => {
      state.distrustedUsers = action.payload;
    })
    .addCase(storeUserKudos, (state, action) => {
      state.kudos = action.payload;
    })
)
