import { SnackbarState, SnackbarActionTypes, SnackbarActions } from './snackbarTypes';
import { Reducer } from 'redux';

const initialSnackbarState: SnackbarState = {
    error: false,
    errorMsg: null,
    info: false,
    infoMsg: null
};

export const snackbarReducer: Reducer<SnackbarState, SnackbarActions> = (state = initialSnackbarState, action) => {
    switch (action.type) {
        case SnackbarActionTypes.SET_ERROR: {
            return {
                ...state,
                error: true,
                errorMsg: action.msg
            }
        }
        case SnackbarActionTypes.CLEAR_ERROR: {
            return {
                ...state,
                error: false,
                errorMsg: null
            }
        }
        case SnackbarActionTypes.SET_INFO: {
            return {
                ...state,
                info: true,
                infoMsg: action.msg
            }
        }
        case SnackbarActionTypes.CLEAR_INFO: {
            return {
                ...state,
                info: false,
                infoMsg: null
            }
        }
    }

    return state;
}