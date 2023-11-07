import { all } from 'redux-saga/effects';
import authSagas from 'enl-redux/modules/authSagas';
import adminAuthSagas from '../containers/Login/authSaga';
import auditListSagas from '../containers/AuditLogs/AuditListSaga'
import roleSagas from '../containers/App/CommonRedux/roleSaga';
import healthFacilitySaga from '../containers/App/CommonRedux/healthFacilitySaga';
import embassySaga from '../containers/App/CommonRedux/embassySaga';
import citizenSaga from '../containers/App/CommonRedux/citizenSaga';
import provinceSaga from '../containers/App/CommonRedux/provinceSaga';
import districtSaga from '../containers/App/CommonRedux/districtSaga';
import sectorSaga from '../containers/App/CommonRedux/sectorSaga';
import cellSaga from '../containers/App/CommonRedux/cellSaga';
import userSaga from '../containers/UserSettings/CreateUser/userSaga';
import userListSaga from '../containers/UserSettings/UserList/userListSaga';
import updateUserSaga from '../containers/UserSettings/UserList/updateUserSaga';
import nurseSaga from '../containers/GeneralSettings/Nurses/nursesSaga';
import resetPasswordSaga from '../containers/App/CommonRedux/resetPasswordSaga';
import uploadFileSagas from '../containers/App/CommonRedux/upload/saga';


export default function* sagas() {
  yield all([
    ...authSagas,
    ...adminAuthSagas,
    ...auditListSagas,
    ...roleSagas,
    ...healthFacilitySaga,
    ...embassySaga,
    ...citizenSaga,
    ...provinceSaga,
    ...districtSaga,
    ...sectorSaga,
    ...cellSaga,
    ...userSaga,
    ...userListSaga,
    ...updateUserSaga,
    ...nurseSaga,
    ...resetPasswordSaga,
    ...uploadFileSagas
  ]);
}
