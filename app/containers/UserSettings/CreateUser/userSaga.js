import {
  all, call, put, takeEvery, fork
} from 'redux-saga/effects';
import API from '../../../config/axiosConfig';
import * as URL from '../../../lib/apiUrls';
import { CREATE_NEW_USER, GET_USER, EDIT_USER } from './constants';
import {
  createNewUserRequest,
  createNewUserSuccess,
  createNewUserError,
  getUserSuccess,
  getUserError,
  getUserRequest,
  editUserRequest,
  editUserSuccess,
  editUserError,
} from './userActions';

export function* fetchCitizenAsync(action) {
  const url = URL.USERS;
  try {
    yield put(createNewUserRequest());
    const data = yield call(() => API.post(url, action.payload));
    yield put(createNewUserSuccess(data));
  } catch (error) {
    yield put(createNewUserError());
  }
}

export function* getUserAsync(action) {
  const {
    id
  } = action.payload;
  const url = URL.USERS;
  try {
    yield put(getUserRequest());
    const data = yield call(() => API.get(url + `/${id}`));
    yield put(getUserSuccess(data));
  } catch (error) {
    yield put(getUserError());
  }
}

export function* editUserAsync(action) {
  const url = URL.USERS;
  try {
    yield put(editUserRequest());
    const data = yield call(() => API.put(url, action.payload));
    yield put(editUserSuccess(data));
  } catch (error) {
    yield put(editUserError());
  }
}

function* userRootSaga() {
  yield all([
    yield takeEvery(CREATE_NEW_USER, fetchCitizenAsync),
    yield takeEvery(EDIT_USER, editUserAsync),
    yield takeEvery(GET_USER, getUserAsync)
  ]);
}

const userSagas = [
  fork(userRootSaga),
];

export default userSagas;
