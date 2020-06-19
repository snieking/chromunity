import { CommonState } from "./common-types";
import { createReducer } from "@reduxjs/toolkit";
import { toggleTutorial, updateRateLimited, setOperationPending, setQueryPending } from "./common-actions";

const initialCommonState: CommonState = {
  tutorial: false,
  rateLimited: false,
  queryPending: false,
  operationPending: false,
};

export const commonReducer = createReducer(initialCommonState, builder =>
  builder
    .addCase(toggleTutorial, (state, action) => {
      state.tutorial = action.payload;
    })
    .addCase(updateRateLimited, (state, action) => {
      state.rateLimited = action.payload;
    })
    .addCase(setOperationPending, (state, action) => {
      state.operationPending = action.payload;
    })
    .addCase(setQueryPending, (state, action) => {
      state.queryPending = action.payload;
    })
)
