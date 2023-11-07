import {
  all, call, put, takeEvery, fork
} from 'redux-saga/effects';
import {
  NURSE_LIST,
  NURSE_CREATE,
  NURSE_UPDATE,
  NURSE_DELETE
} from './constants';
import {
  nursesListRequest,
  nursesListSuccess,
  nursesListError,
  createNurseRequest,
  createNurseSuccess,
  createNurseError,
  updateNurseRequest,
  updateNurseSuccess,
  updateNurseError,
  nurseDeleteRequest,
  nurseDeleteSuccess,
  nurseDeleteError
} from './nursesAction';
import API from '../../../config/axiosConfig';
import * as URL from '../../../lib/apiUrls';

export function* nurseListAsync(action) {
  const params = action.payload;
  try {
    yield put(nursesListRequest());
    const data = yield call(() => API.get(URL.NURSES, { params }));
    yield put(nursesListSuccess(data));
  } catch (error) {
    yield put(nursesListError());
  }
}

export function* createNurseAsync(action) {
  try {
    yield put(createNurseRequest());
    const data = yield call(() => API.post(URL.NURSES, action.payload));
    yield put(createNurseSuccess(data));
  } catch (error) {
    yield put(createNurseError(error));
  }
}

export function* updateNurseAsync(action) {
  try {
    yield put(updateNurseRequest());
    const data = yield call(() => API.put(`${URL.NURSES}/${action.id}`, action.payload));
    yield put(updateNurseSuccess(data));
  } catch (error) {
    yield put(updateNurseError());
  }
}

export function* deleteNurse(action) {
  try {
    yield put(nurseDeleteRequest());
    const data = yield call(() => API.delete(`${URL.NURSES}/${action.payload}`));
    yield put(nurseDeleteSuccess(data));
  } catch (error) {
    yield put(nurseDeleteError());
  }
}

function* nursesRootSaga() {
  yield all([
    yield takeEvery(NURSE_LIST, nurseListAsync),
    yield takeEvery(NURSE_CREATE, createNurseAsync),
    yield takeEvery(NURSE_UPDATE, updateNurseAsync),
    yield takeEvery(NURSE_DELETE, deleteNurse)
  ]);
}

const nursesSagas = [
  fork(nursesRootSaga),
];

export default nursesSagas;
