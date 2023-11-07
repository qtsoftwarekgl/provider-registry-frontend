import _ from 'lodash';
import {
  NURSE_LIST,
  NURSE_LIST_REQUEST,
  NURSE_LIST_SUCCESS,
  NURSE_LIST_ERROR,
  NURSE_DELETE,
  NURSE_CREATE,
  NURSE_CREATE_REQUEST,
  NURSE_CREATE_SUCCESS,
  NURSE_CREATE_ERROR,
  NURSE_UPDATE,
  NURSE_UPDATE_REQUEST,
  NURSE_UPDATE_SUCCESS,
  NURSE_UPDATE_ERROR,
  NURSE_DELETE_REQUEST,
  NURSE_DELETE_SUCCESS,
  NURSE_DELETE_ERROR,
  NURESE_STORE_CLEAR
} from './constants';

export function nursesList(params) {
  const payload = {
    page: 1,
    limit: 20
  };
  if (!_.isEmpty(params)) {
    Object.keys(params).forEach(key => {
      payload[key] = params[key];
    });
  }
  return {
    type: NURSE_LIST,
    payload
  };
}

export function nursesListRequest() {
  return {
    type: NURSE_LIST_REQUEST
  };
}

export function nursesListSuccess(response) {
  return {
    type: NURSE_LIST_SUCCESS,
    nurses: response.status === 'ok' ? response.data : [],
    count: response.status === 'ok' ? response.count : 0,
  };
}

export function nursesListError() {
  return {
    type: NURSE_LIST_ERROR
  };
}

export function deleteNurse(id) {
  return {
    type: NURSE_DELETE,
    payload: id
  };
}

export function nurseDeleteRequest() {
  return {
    type: NURSE_DELETE_REQUEST
  };
}

export function nurseDeleteSuccess(response) {
  return {
    type: NURSE_DELETE_SUCCESS,
    nurseDeleteStatus: response.status
  };
}

export function nurseDeleteError() {
  return {
    type: NURSE_DELETE_ERROR
  };
}

export function createNurse(nurseData) {
  return {
    type: NURSE_CREATE,
    payload: nurseData
  };
}

export function createNurseRequest() {
  return {
    type: NURSE_CREATE_REQUEST
  };
}

export function createNurseSuccess(response) {
  let errorMessage = '';
  if (response.status === 'error') {
    errorMessage = response.message;
  }
  return {
    type: NURSE_CREATE_SUCCESS,
    createNurseStatus: response.status,
    errorMessage
  };
}

export function createNurseError(response) {
  let errorMessage = '';
  if (response.status === 'error') {
    errorMessage = response.message;
  }
  return {
    type: NURSE_CREATE_ERROR,
    createNurseStatus: response.status,
    errorMessage
  };
}

export function updateNurse(id, nurseData) {
  return {
    type: NURSE_UPDATE,
    payload: nurseData,
    id
  };
}

export function updateNurseRequest() {
  return {
    type: NURSE_UPDATE_REQUEST
  };
}

export function updateNurseSuccess(response) {
  return {
    type: NURSE_UPDATE_SUCCESS,
    updateNurseStatus: response.status,
    errorMessage: response.message
  };
}

export function updateNurseError(response) {
  return {
    type: NURSE_UPDATE_ERROR,
    updateNurseStatus: 'error',
    errorMessage: response.message
  };
}

export function clearNurseStore() {
  return {
    type: NURESE_STORE_CLEAR
  };
}
