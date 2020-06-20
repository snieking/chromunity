import { createAction } from '@reduxjs/toolkit';
import { CommonActionTypes } from './common-types';
import { withPayloadType } from './util';

export const toggleTutorial = createAction(CommonActionTypes.TOGGLE_TUTORIAL);

export const setRateLimited = createAction(CommonActionTypes.SET_RATE_LIMITED);

export const updateRateLimited = createAction(CommonActionTypes.UPDATE_RATE_LIMITED, withPayloadType<boolean>());

export const setOperationPending = createAction(CommonActionTypes.SET_OPERATION_PENDING, withPayloadType<boolean>());

export const setQueryPending = createAction(CommonActionTypes.SET_QUERY_PENDING, withPayloadType<boolean>());
