import { fromJS } from 'immutable';
import {
  NURSE_LIST_ERROR,
  NURSE_LIST_REQUEST,
  NURSE_LIST_SUCCESS,
  NURSE_CREATE_REQUEST,
  NURSE_CREATE_SUCCESS,
  NURSE_CREATE_ERROR,
  NURSE_UPDATE_REQUEST,
  NURSE_UPDATE_SUCCESS,
  NURSE_UPDATE_ERROR,
  NURSE_DELETE_REQUEST,
  NURSE_DELETE_SUCCESS,
  NURSE_DELETE_ERROR,
  NURESE_STORE_CLEAR
} from './constants';

export const initialState = fromJS({});

function nurseReducer(state = initialState, action) {
  switch (action.type) {
    case NURSE_LIST_REQUEST:
      return Object.assign({}, state, {
        loading: true,
        nurseDeleteStatus: '',
        updateNurseStatus: '',
        createNurseStatus: '',
        errorMessage: ''
      });
    case NURSE_LIST_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        nurses: action.nurses,
        count: action.count
      });
    case NURSE_LIST_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: true
      });
    case NURSE_CREATE_REQUEST:
      return Object.assign({}, state, {
        loading: true,
        errorMessage: ''
      });
    case NURSE_CREATE_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        createNurseStatus: action.createNurseStatus,
        errorMessage: action.errorMessage
      });
    case NURSE_CREATE_ERROR:
      return Object.assign({}, state, {
        loading: false,
        createNurseStatus: action.createNurseStatus,
        errorMessage: action.errorMessage,
        error: true
      });
    case NURSE_UPDATE_REQUEST:
      return Object.assign({}, state, {
        loading: true
      });
    case NURSE_UPDATE_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        updateNurseStatus: action.updateNurseStatus,
        errorMessage: action.errorMessage,
      });
    case NURSE_UPDATE_ERROR:
      return Object.assign({}, state, {
        loading: false,
        updateNurseStatus: action.updateNurseStatus,
        errorMessage: action.errorMessage,
        error: true
      });
    case NURSE_DELETE_REQUEST:
      return Object.assign({}, state, {
        loading: true
      });
    case NURSE_DELETE_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        nurseDeleteStatus: action.nurseDeleteStatus
      });
    case NURSE_DELETE_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: true
      });
    case NURESE_STORE_CLEAR:
      return Object.assign({}, state, {
        loading: false,
        nurseDeleteStatus: '',
        createNurseStatus: '',
        updateNurseStatus: '',
        errorMessage: ''
      });
    default:
      return state;
  }
}

export default nurseReducer;
