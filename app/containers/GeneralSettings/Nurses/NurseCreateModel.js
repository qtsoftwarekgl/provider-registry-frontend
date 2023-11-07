import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import { lightBlue } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import { ThemeProvider } from '@material-ui/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AsyncSelect from 'react-select/async';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import classNames from 'classnames';
import _ from 'lodash';
import SuccessAlert from 'enl-components/Alerts/SuccessAlert';
import ErrorAlert from 'enl-components/Alerts/ErrorAlert';
import ConfirmationAlert from 'enl-components/Alerts/ConfirmationAlert';
import Select from '@material-ui/core/Select';
import LoadingAlert from 'enl-components/Alerts/LoadingAlert';
import defaultUserImg from 'enl-images/user-default.jpg';
import moment from 'moment';
import API from '../../../config/axiosConfig';
import * as URL from '../../../lib/apiUrls';
import { REGEX, PHONE_LENGTH, DATE_TIME_FORMAT,DATE_FORMAT } from '../../../lib/constants';
import {
  DOCUMENT_TYPE_ERROR,
  HEALTH_FACILITY_ERROR,
  LICENSE_NUMBER_ERROR,
  QUALIFICATION_ERROR
} from './constants';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { fetchProvinces } from '../../App/CommonRedux/provinceActions';
import { fetchDistricts } from '../../App/CommonRedux/districtActions';
import { fetchSectors } from '../../App/CommonRedux/sectorActions';
import { fetchCells } from '../../App/CommonRedux/cellActions';
import { fetchCitizen, clearCitizenStore } from '../../App/CommonRedux/citizenActions';
import { createNurse, updateNurse, clearNurseStore } from './nursesAction';
import { getErrorMessage, getNationality } from '../../../utils/helpers';
import ReactSelect from 'react-select';
import qualificationList from './qualifications'

const styles = () => ({
  root: {
    '& .MuiDialog-paperWidthSm': {
      maxWidth: 900,
      minWidth: 900
    },
    MuiFormLabel: {
      asterisk: {
        color: '#db3131',
        '&$error': {
          color: '#db3131'
        },
      }
    }
  },
  titleRoot: {
    marginBottom: 10,
    padding: 14
  },
  label: {
    fontWeight: 'bold'
  },
  value: {
    marginLeft: 10
  },
  defaultContainer: {
    backgroundColor: '#f5f5f5',
    margin: 'auto',
    marginTop: 15
  },
  formContainer: {
    margin: 'auto',
  },
  borderDanger: {
    border: '0.063rem solid #db3131',
    borderRadius: 3
  },
});

const theme = createMuiTheme({
  palette: {
    primary: lightBlue,
  },
  overrides: {
    MuiFormLabel: {
      asterisk: {
        color: '#db3131',
        '&$error': {
          color: '#db3131'
        },
      }
    }
  }
});

let formSubmit = false;

const initialState = {
  form: {
    name: '',
    surName:'',
    postNames: '',
    dateOfBirth : null,
    sex : '',
    maritalStatus : '',
    nationality : '',
    documentType: '',
    documentNumber:'',
    locationCode: '',
    status: 'ACTIVE',
    selectedCitizen: [],
    phoneNumber: '',
    email: '',
    // identifier: '',
    licenseExpiryDate:'',
    facilityId: [],
    licenseNumber: '',
    qualification: ''
  },
  error: {
    name: '',
    surName:'',
    postNames: '',
    documentType: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    docNumber: '',
    dateOfBirth : '',
    sex : '',
    maritalStatus : '',
    nationality : '',
    documentType: '',
    documentNumber:''
  },
  id: '',
  created: false,
  showScuccessModel: false,
  showErrorModel: false,
  showConfirmModel: false,
  alertMessage: '',
  confirmAlertMessage: '',
  createNurseStatus: '',
  updateNurseStatus: '',
  provinceDefaultValue: {},
  districtDefaultValue: {},
  sectorDefaultValue: {},
  cellDefaultValue: {},
  villageDefaultValue: {},
  selectedFacility: null,
  selectedQualificaton : null,
  showLoadingModel: false,
  citizenPhotoUrl: '',
  docNumber: '',
  tempCitizen: null,
  hasUpdateHappened: false,
  showErrorBorder: false
};

class NurseCreateModel extends Component {
  constructor(props) {
    super(props);
    this.state = _.cloneDeep(initialState);
  }

  componentDidMount() {
    const {
      handleFetchProvinces
    } = this.props;
    this.getHealthFacility();
    handleFetchProvinces();
    this.setState(initialState);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const updatedState = {};
    const {
      handleClearNurseStore, updateNurseStatus, createNurseStatus, errorMessage
    } = nextProps;

    updatedState.selectedDocumentNumber = true;
    if (createNurseStatus === 'ok') {
      formSubmit = true;
      updatedState.showScuccessModel = true;
      updatedState.showLoadingModel = false;
      updatedState.createNurseStatus = nextProps.createNurseStatus;
      updatedState.alertMessage = 'Provider created successfully.';
      handleClearNurseStore();
    }

    if (updateNurseStatus === 'ok') {
      formSubmit = true;
      updatedState.showScuccessModel = true;
      updatedState.showLoadingModel = false;
      updatedState.updateNurseStatus = nextProps.updateNurseStatus;
      updatedState.alertMessage = 'Provider updated successfully.';
      handleClearNurseStore();
    }

    if (createNurseStatus === 'error') {
      formSubmit = true;
      updatedState.showErrorModel = true;
      updatedState.showLoadingModel = false;
      updatedState.createNurseStatus = nextProps.createNurseStatus;
      if (errorMessage.includes('doc_no_or_license_no_already_exist')) {
        updatedState.alertMessage = 'Provider already exists.';
      } else {
        updatedState.alertMessage = getErrorMessage(errorMessage);
      }
      handleClearNurseStore();
    }

    if (updateNurseStatus === 'error') {
      formSubmit = true;
      updatedState.showErrorModel = true;
      updatedState.showLoadingModel = false;
      updatedState.updateNurseStatus = nextProps.updateNurseStatus;
      if (errorMessage.includes('doc_no_or_license_no_already_exist')) {
        updatedState.alertMessage = 'Provider already exists.';
      } else {
        updatedState.alertMessage = getErrorMessage(errorMessage);
      }
      handleClearNurseStore();
    }

    if (!nextProps.editData._id) {
      updatedState.id = '';
    }
    if (nextProps.editData && nextProps.editData._id && nextProps.editData._id !== prevState.id && !formSubmit) {
      const data = nextProps.editData;
      updatedState.hasUpdateHappened = false;
      formSubmit = true;
      updatedState.form = data;
      updatedState.form.selectedCitizen = {
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        surName: data.surName,
        postNames: data.postNames,
        dateOfBirth: data.dateOfBirth,
        maritalStatus: data.maritalStatus,
        sex: data.sex,
        nationality: data.nationality,
        domicileCountry: data.domicileCountry,
        domicileDistrict: data.domicileDistrict,
        domicileProvince: data.domicileProvince,
        domicileSector: data.domicileSector,
        domicileCell: data.domicileCell,
        domicileVillage: data.domicileVillage,
        licenseNumber: data.licenseNumber,
        licenseExpiryDate: data.licenseExpiryDate,
        qualification: data.qualification,
        email: data.email,
        // identifier:data.identifier,        
        phoneNumber: data.phoneNumber,
        photo: data.photo,
        status: data.status,
        facilityId: data.facilityId,
        // issueNumber: data.issueNumber,
        // dateOfIssue: data.dateOfIssue,
        // dateOfExpiry: moment(data.dateOfExpiry).format(DATE_TIME_FORMAT),
        // placeOfIssue: data.placeOfIssue,
        applicationNumber: data.applicationNumber,
        nin: data.nin,
        nid: data.nid,
        passportNumber: data.passportNumber,
        // refugeeNumber: data.refugeeNumber,
        fatherName: data.fatherName,
        motherName: data.motherName,
        birthCountry: data.birthCountry,
        countryOfBirth: data.countryOfBirth,
        villageId: data.villageId,
        civilStatus: data.civilStatus,
        spouse: data.spouse,
        applicantType: data.applicantType
      };
      updatedState.form.licenseExpiryDate=data.licenseExpiryDate;     
      updatedState.citizenPhotoUrl = data.photo;
      const facilities = [];
      _.each(data.facilities, (item) => {
        facilities.push({ value: item._id, label: item.name });
      });
      updatedState.selectedFacility = facilities;
      updatedState.id = nextProps.editData._id;
      
      let qualify;
      qualify = _.find(qualificationList, { label: data.qualification });
      if (qualify){
        updatedState.selectedQualificaton = {value:qualify.value, label:qualify.qualification} || null;
      }   
    }
    return updatedState;
  }

  handleDateChange = (name, date) => {
    const stateCopy = _.cloneDeep(this.state);
    if (date) {
      stateCopy.hasUpdateHappened = true;
      this.setState(stateCopy);
    }
    console.log(name,date);
    stateCopy.form[name] = date;
    stateCopy.error[name] = '';
    this.setState(stateCopy);
  }
  handleChange = (name) => event => {
    const stateCopy = _.cloneDeep(this.state);
    const { form } = stateCopy;
    if (name === 'documentType') {
      stateCopy.showErrorBorder = false;
      stateCopy.form.name = '';
      stateCopy.form.surName = '';
      stateCopy.form.postNames = '';
      stateCopy.form.dateOfBirth = '';
      stateCopy.form.nationality = '';
      stateCopy.form.documentType = '';
      stateCopy.form.documentNumber = '';
      stateCopy.form.locationCode = '';
      stateCopy.form.status = 'ACTIVE';
      stateCopy.form.selectedCitizen = null;
      stateCopy.form.phoneNumber = '';
      stateCopy.form.email = '';
      stateCopy.form.domicileCountry = '';
      stateCopy.form.domicileProvince = '';
      stateCopy.form.domicileDistrict = '';
      stateCopy.form.domicileSector = '';
      stateCopy.form.domicileCell = '';
      stateCopy.form.domicileVillage = '';
      // stateCopy.form.identifier='';
      stateCopy.form.licenseExpiryDate= '',    
      stateCopy.form.facilityId = [];
      stateCopy.form.licenseNumber = '';
      stateCopy.form.qualification = '';
      stateCopy.error.surName = '';
      stateCopy.error.postNames = '';
      stateCopy.error.dateOfBirth = '';
      stateCopy.error.nationality = '';
      stateCopy.error.documentType = '';
      stateCopy.error.documentNumber = '';
      stateCopy.error.locationCode = '';
      stateCopy.error.name = '';
      stateCopy.error.documentType = '';
      stateCopy.error.province = '';
      stateCopy.error.district = '';
      stateCopy.error.sector = '';
      stateCopy.error.cell = '';
      stateCopy.error.village = '';
      stateCopy.error.docNumber = '';
      stateCopy.error.licenseNumber = '';
      stateCopy.error.facilityId = '';
      stateCopy.error.qualification = '';
      stateCopy.error.phoneNumber = '';
      stateCopy.error.email = '';
      // stateCopy.error.identifier= '';
      stateCopy.error.licenseExpiryDate= '';
      stateCopy.selectedFacility = null;
      stateCopy.selectedQualificaton = null;
      stateCopy.citizenPhotoUrl = '';
      stateCopy.docNumber = '';
    }
    if (event.target.value) {
      stateCopy.hasUpdateHappened = true;
      this.setState(stateCopy);
    }
    const pattern = new RegExp('^[0-9a-zA-Z- ]*$');
    if (name === 'province') {
      const { provinces, handleFetchDistricts } = this.props;
      const province = _.find(provinces, { _id: event.target.value });
      if (province) {
        handleFetchDistricts();
      }
    }
    if (name === 'district') {
      const { districts, handleFetchSectors } = this.props;
      const district = _.find(districts, { _id: event.target.value });
      if (district) {
        handleFetchSectors();
      }
    }
    if (name === 'sector') {
      const { sectors, handleFetchCells } = this.props;
      const sector = _.find(sectors, { _id: event.target.value });
      if (sector) {
        handleFetchCells();
      }
    }
    if (name === 'licenseNumber') {
      if (pattern.test(event.target.value)) {
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
    } else {
      stateCopy.form[name] = event.target.value;
      stateCopy.error[name] = '';
    }
    if(form.documentType === 'FOREIGN_ID' || form.documentType === 'PASSPORT'){
      if (name === 'sex') {
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
      if(name == 'surName'){
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
      if(name == 'postNames'){
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
      if(name == 'dateOfBirth'){
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
      if(name == 'maritalStatus'){
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
      if(name == 'nationality'){
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
      if(name == 'documentNumber'){
        stateCopy.form[name] = event.target.value;
        stateCopy.error[name] = '';
      }
    }
    this.setState(stateCopy);
  };

  handleValidation = () => {
    let validation = true;
    const stateCopy = _.cloneDeep(this.state);
    const { form } = stateCopy;
    if(form.documentType != 'FOREIGN_ID' && form.documentType != 'PASSPORT'){
      if (!form.selectedCitizen) {
        validation = false;
        stateCopy.showErrorBorder = true;
        this.setState(stateCopy);
        stateCopy.error.docNumber = 'Please enter document number and select citizen.';
      }
    }    
    if (form.documentType === '') {
      stateCopy.error.documentType = DOCUMENT_TYPE_ERROR;
      validation = false;
    }
    const facility = form.facilityId;
    if (facility.length === 0) {
      stateCopy.error.facilityId = HEALTH_FACILITY_ERROR;
      validation = false;
    }
    if (form.licenseNumber === '') {
      stateCopy.error.licenseNumber = LICENSE_NUMBER_ERROR;
      validation = false;
    }
    if (form.qualification === '') {
      stateCopy.error.qualification = QUALIFICATION_ERROR;
      validation = false;
    }
    if (form.phoneNumber && form.phoneNumber !== '' && !REGEX.PHONE_WITH_COUNTRY_CODE.test(form.phoneNumber)) {
      validation = false;
      stateCopy.error.phoneNumber = 'Please enter a valid phone number with country code. eg: +250xxxxxxx, +256xxxxxxx, +243xxxxxxx or +257xxxxxxx';
    }
    if (form.email === '') {
      stateCopy.error.email = 'Please enter valid email.';
      validation = false;
    }
    // if (form.identifier === '') {
    //   stateCopy.error.identifier = 'Please enter valid identifier.';
    //   validation = false;
    // }    
    if (form.licenseExpiryDate === '') {
      stateCopy.error.licenseExpiryDate = 'Please enter valid license expiry date.';
      validation = false;
    }
    if (form.phoneNumber === '' && !REGEX.PHONE.test(form.email)) {
      stateCopy.error.phoneNumber = 'Please enter valid phone number.';
      validation = false;
    }
    if (form.email && form.email !== '' && !REGEX.EMAIL.test(form.email)) {
      validation = false;
      stateCopy.error.email = 'Please enter valid email.';
    }
  if(form.documentType === 'FOREIGN_ID' || form.documentType === 'PASSPORT'){
   if (form.surName === '') {
      stateCopy.error.surName = 'Please enter surName.';
      validation = false;
    }
    if (form.postNames === '') {
      stateCopy.error.postNames = 'Please enter postNames.';
      validation = false;
    }
    if (form.nationality === '') {
      stateCopy.error.nationality = 'Please enter your nationality.';
      validation = false;
    }
    if (form.sex === '') {
      stateCopy.error.sex = 'Please enter your gender.';
      validation = false;
    }
    if (form.maritalStatus === '') {
      stateCopy.error.maritalStatus = 'Please enter maritalStatus.';
      validation = false;
    }
    if (form.documentNumber === '') {
      stateCopy.error.documentNumber = 'Please enter documentNumber.';
      validation = false;
    }
    if (form.dateOfBirth === '') {
      stateCopy.error.dateOfBirth = 'Please enter dateOfBirth.';
      validation = false;
    }
  }
    this.setState(stateCopy);
    return validation;
  }

  handleAlertClose = () => {
    const { onClose } = this.props;
    this.setState(initialState, () => {
      formSubmit = false;
      onClose();
    });
  }

  handleErrorAlertClose = () => {
    this.setState({ showErrorModel: false });
  }

  handleAlertConfirmationClose = () => {
    this.setState({ showConfirmModel: false });
  }

  handleConfirm = async () => {
    formSubmit = false;
    const stateCopy = _.cloneDeep(this.state);
    const { form, citizenPhotoUrl } = stateCopy;
    const { selectedCitizen } = form;
    this.setState({ showConfirmModel: false, showLoadingModel: true });
    const nureseData = {
      documentType: form.documentType,
      documentNumber: form.documentNumber ? form.documentNumber : form.selectedCitizen.documentNumber,
      surName: form.surName ? form.surName : form.selectedCitizen.surName,
      postNames: form.postNames ? form.postNames : form.selectedCitizen.postNames,
      dateOfBirth: form.dateOfBirth ? form.dateOfBirth : form.selectedCitizen.dateOfBirth,
      maritalStatus: form.maritalStatus ? form.maritalStatus : form.selectedCitizen.maritalStatus,
      sex: form.sex ? form.sex : form.selectedCitizen.sex,
      nationality: form.nationality ? form.nationality : form.selectedCitizen.nationality,
      licenseNumber: form.licenseNumber,
      qualification: form.qualification,
      email: form.email,
      // identifier:form.identifier,
      licenseExpiryDate:form.licenseExpiryDate,
      phoneNumber: form.phoneNumber,
      photo: citizenPhotoUrl,
      status: form.status,
      facilityId: form.facilityId,
      // issueNumber: selectedCitizen && selectedCitizen.issueNumber && selectedCitizen.issueNumber,
      // dateOfIssue: selectedCitizen && selectedCitizen.dateOfIssue && selectedCitizen.dateOfIssue,
      // dateOfExpiry: selectedCitizen && selectedCitizen.dateOfExpiry && moment(selectedCitizen.dateOfExpiry).format(DATE_TIME_FORMAT),
      // placeOfIssue: selectedCitizen && selectedCitizen.placeOfIssue && selectedCitizen.placeOfIssue,
      applicationNumber: selectedCitizen && selectedCitizen.applicationNumber && selectedCitizen.applicationNumber,
      nin: selectedCitizen && selectedCitizen.nin && selectedCitizen.nin,
      nid: selectedCitizen && selectedCitizen.nid && selectedCitizen.nid,
      passportNumber: selectedCitizen && selectedCitizen.passportNumber && selectedCitizen.passportNumber,
      // refugeeNumber: selectedCitizen && selectedCitizen.refugeeNumber && selectedCitizen.refugeeNumber,
      fatherName: selectedCitizen && selectedCitizen.fatherName && selectedCitizen.fatherName,
      motherName: selectedCitizen && selectedCitizen.motherName && selectedCitizen.motherName,
      birthCountry: selectedCitizen && selectedCitizen.birthCountry && selectedCitizen.birthCountry,
      countryOfBirth: selectedCitizen && selectedCitizen.countryOfBirth && selectedCitizen.countryOfBirth,
      villageId: selectedCitizen && selectedCitizen.villageId && selectedCitizen.villageId,
      civilStatus: selectedCitizen && selectedCitizen.civilStatus && selectedCitizen.civilStatus,
      spouse: selectedCitizen && selectedCitizen.spouse && selectedCitizen.spouse,
      applicantType: selectedCitizen && selectedCitizen.applicantType && selectedCitizen.applicantType
    };
    if(form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'){
      nureseData.domicileCountry=form.selectedCitizen.domicileCountry ? form.selectedCitizen.domicileCountry : '';
      nureseData.domicileDistrict = form.selectedCitizen.domicileDistrict ? form.selectedCitizen.domicileDistrict : '';
      nureseData.domicileProvince =  form.selectedCitizen.domicileProvince ? form.selectedCitizen.domicileProvince : '';
      nureseData.domicileSector = form.selectedCitizen.domicileSector ? form.selectedCitizen.domicileSector : '';
      nureseData.domicileCell = form.selectedCitizen.domicileCell ? form.selectedCitizen.domicileCell : '';
      nureseData.domicileVillage = form.selectedCitizen.domicileVillage ? form.selectedCitizen.domicileVillage : '';
    }else{
      nureseData.domicileCountry=form.domicileCountry ? form.domicileCountry :'';
      nureseData.domicileDistrict = form.domicileDistrict ? form.domicileDistrict :'';
      nureseData.domicileProvince =  form.domicileProvince ? form.domicileProvince :'';
      nureseData.domicileSector = form.domicileSector ? form.domicileSector :'';
      nureseData.domicileCell = form.domicileCell ? form.domicileCell :'';
      nureseData.domicileVillage = form.domicileVillage ? form.domicileVillage :'';
    }
    console.log("nureseData",nureseData)

    if (nureseData.phoneNumber === '') {
      delete nureseData.phoneNumber;
    }

    if (nureseData.email === '') {
      delete nureseData.email;
    }
    const { id } = this.state;
    const { handleCreateNurse, handleUpdateNurse } = this.props;
    if (id) {
      handleUpdateNurse(id, nureseData);
    } else {
      handleCreateNurse(nureseData);
    }
  }

  handleSubmit = () => {
    const { id } = this.state;
    if (this.handleValidation()) {
      if (id) {
        this.setState({ showConfirmModel: true, confirmAlertMessage: 'Do you want to update' });
      } else {
        this.setState({ showConfirmModel: true, confirmAlertMessage: 'Do you want to add this new Provider' });
      }
    }
  }

  handleFormClose = () => {
    const { onClose } = this.props;
    this.setState(initialState, () => {
      formSubmit = false;
      onClose();
    });
  }

  documentNumberValidation = (documentType, input) => {
    let isValid = false;
    let errorMsg = '';
    let inputValue = input;
    if (documentType === 'NID') {
      if (inputValue && inputValue.length && inputValue.length === 16) {
        isValid = true;
      } else if (inputValue.length && inputValue.length < 16) {
        errorMsg = 'A minimum of 16 digits is required';
      } else if (inputValue.length && inputValue.length > 16) {
        errorMsg = 'Invalid document number';
      }
    } else if (documentType === 'NID_APPLICATION_NUMBER') {
      if (inputValue && inputValue.length && inputValue.length === 8) {
        isValid = true;
      } else if (inputValue.length && inputValue.length < 16) {
        errorMsg = 'A minimum of 8 digits is required';
      } else if (inputValue.length && inputValue.length > 8) {
        errorMsg = 'Invalid document number';
      }
    } else if (documentType === 'NIN') {
      inputValue = inputValue.replace(/-/g, '');
      if (inputValue && inputValue.length && inputValue.length === 10) {
        isValid = true;
      } else if (inputValue.length && inputValue.length < 10) {
        errorMsg = 'A minimum of 10 digits is required';
      } else if (inputValue.length && inputValue.length > 10) {
        errorMsg = 'Invalid document number';
      }
    }
    return { isValid, errorMsg };
  }

  handleInputChange = async (inputValue) => { // eslint-disable-line
    const { form } = this.state;
    const stateCopy = _.cloneDeep(this.state);
    if (form.documentType) {
      const valid = this.documentNumberValidation(form.documentType, inputValue);
      if (valid.isValid) {
        const docData = {
          documentType: form.documentType,
          documentNumber: inputValue
        };
        const res = await API.post(URL.GET_CITIZEN, docData)
          .then(async (response) => {
            if (response.status === 'ok') {
              const result = response.data;
              this.setState({ tempCitizen: result });
              const { dateOfBirth, citizenStatus } = result;
              if (citizenStatus !== '13' && moment().diff(moment(dateOfBirth, 'DD-MM-YYYY'), 'years') < 18) {
                this.setState({
                  showErrorModel: true,
                  alertMessage: 'User minimum age must be 18 years.'
                });
                return [];
              }
              if (citizenStatus === '13' || citizenStatus === 13) {
                this.setState({
                  showErrorModel: true,
                  alertMessage: 'User should be alive.'
                });
                return [];
              }
              const data = [{
                value: result.documentNumber.replace(/\s/g, ''),
                label: `${result.surName} - ${result.documentNumber.replace(/\s/g, '')}`
              }];
              return data;
            }

            this.setState({
              showErrorAlert: true,
              errorAlertMessage: 'No record(s) found for this document.'
            });
            return [];
          })
          .catch((e) => {
            console.log('ERROR', e);
            return [];
          });
        return res;
      }
      if (!valid.isValid) {
        stateCopy.error.docNumber = valid.errorMsg;
        this.setState(stateCopy);
        return [];
      }
    } else {
      stateCopy.error.documentType = 'Please select document type.';
      this.setState(stateCopy);
      return [];
    }
  }

  handleGetCitizen = (docNumber, triggeredAction) => {
    console.log(docNumber)
    if (triggeredAction.action === 'clear') {
      this.setState(initialState);
    } else {
      const { tempCitizen } = this.state;
      const stateCopy = _.cloneDeep(this.state);
      stateCopy.showErrorBorder = false;
      stateCopy.citizenPhotoUrl = tempCitizen.photo;
      stateCopy.docNumber = docNumber;
      stateCopy.error.docNumber = '';
      stateCopy.form.selectedCitizen = tempCitizen;
      this.setState(stateCopy);
    }
  }

  handleChangeDropdown = (selected, name) => {
    const facilities = [];
    _.each(selected, (item) => {
      facilities.push(item.value);
    });
    const stateCopy = _.cloneDeep(this.state);
    stateCopy.hasUpdateHappened = true;
    stateCopy.selectedFacility = selected;
    stateCopy.form[name] = facilities;
    stateCopy.error[name] = '';
    this.setState(stateCopy);
    return selected;
  }

  handleChangeSelect=async(selected, name)=>{
    let qlisht = selected.label;
    const stateCopy = _.cloneDeep(this.state);
    stateCopy.hasUpdateHappened = true;
    stateCopy.selectedQualificaton = selected;
    stateCopy.form[name] = qlisht;
    stateCopy.error[name] = '';
    this.setState(stateCopy);
    return selected;
  }

  getHealthFacility = async (value) => {
    const params = {};
    if (value) {
      params.name = value;
    }
    const { selectedFacility } = this.state;
    const res = await API.get(URL.HEALTH_FACILITIES_LIST, { params })
      .then(response => {
        const results = response.data;
        const data = [];
        results.forEach((item) => {
          data.push({
            value: item._id,
            label: item.name
          });
        });
        return data;
      })
      .catch(() => []);
    this.setState({ healthFacilityOptions: res });
    if (!_.isEmpty(selectedFacility)) {
      _.each(selectedFacility, (item) => {
        res.push(item);
      });
    }
    return res;
  }

  render() {
    const {
      classes, open
    } = this.props;
    const {
      form,
      error,
      alertMessage,
      showScuccessModel,
      confirmAlertMessage,
      showConfirmModel,
      showErrorModel,
      id,
      showLoadingModel,
      selectedFacility,
      citizenPhotoUrl,
      healthFacilityOptions,
      docNumber,
      hasUpdateHappened,
      showErrorBorder,
      selectedQualificaton
    } = this.state;
    const { selectedCitizen } = form;
    // if (_.isEmpty(healthFacilityOptions)) {
    //   this.getHealthFacility();
    // }

    const quaList = _.cloneDeep(qualificationList);
    const qualificationsList = []
    quaList.forEach((item)=>{
      qualificationsList.push({
        value:item.value,
        label:item.qualification
      })
    })
    return (
      <div>
        <Dialog
          open={open}
          onClose={this.handleFormClose}
          scroll="paper"
          aria-labelledby="scroll-dialog-title"
          className={classes.root}
        >
          <DialogContent>
            <DialogTitle id="scroll-dialog-title" className={classes.titleRoot}>
              {id ? 'Edit Provider' : 'Create Provider'}
            </DialogTitle>
            <form className={classes.container} noValidate autoComplete="off">
              <Grid container direction="row" spacing={3}>
                <Grid item xs={12} sm={4}>
                  <FormControl error={error.documentType} className={classes.formControlSelect} fullWidth>
                    <ThemeProvider theme={theme}>
                      <InputLabel style={{ }}>
                        Identification Document
                        <span style={{ color: '#db3131' }}>*</span>
                      </InputLabel>
                      <Select
                        disabled={id}
                        value={form.documentType}
                        onChange={this.handleChange('documentType')}
                      >
                        <MenuItem value="NID">NID (National ID)</MenuItem>
                        <MenuItem value="NID_APPLICATION_NUMBER">NID Application Number</MenuItem>
                        <MenuItem value="NIN">NIN</MenuItem>
                        <MenuItem value="FOREIGN_ID">FOREIGNER</MenuItem>
                        <MenuItem value="PASSPORT">PASSPORT</MenuItem>
                      </Select>
                    </ThemeProvider>
                    {error.documentType ? (<FormHelperText>{DOCUMENT_TYPE_ERROR}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'?
                 <div style={{ padding: '10px 0 20px' }}>
                    <InputLabel style={{ position: 'relative', fontSize: 14, top: '-7px' }}>
                             Document Number
                      {' '}
                      <span style={{ color: '#db3131' }}>*</span>
                    </InputLabel>
                    <FormControl className={classes.formControl} fullWidth error={error.docNumber}>
                      <ThemeProvider theme={theme}>
                        <AsyncSelect
                          isDisabled={!!id}
                          loadOptions={(value) => this.handleInputChange(value)}
                          value={docNumber}
                          isClearable
                          onChange={(value, triggeredAction) => { this.handleGetCitizen(value, triggeredAction); }}
                        />
                      </ThemeProvider>
                    </FormControl>
                  </div> 
                : null }
                </Grid>
                <Grid item xs={12} sm={3} style={{ padding: '25px 0' }}>
                  <FormControl className={classes.formControl} fullWidth error={error.docNumber}>
                    {error.docNumber ? (<FormHelperText>{error.docNumber}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" style={{ paddingTop: 15, paddingBottom: 15 }}>
                <Grid item xs={4}>
                  <InputLabel style={{ position: 'relative', fontSize: 16, top: '-7px' }}>
                    Health Facility
                    {' '}
                    <span style={{ color: '#db3131' }}>*</span>
                  </InputLabel>
                  <FormControl error={error.facilityId} className={classes.formControl} fullWidth>
                    <AsyncSelect
                      cacheOptions
                      isClearable
                      isMulti
                      defaultOptions={healthFacilityOptions}
                      loadOptions={this.getHealthFacility}
                      value={selectedFacility}
                      onChange={(selected) => { this.handleChangeDropdown(selected, 'facilityId'); }}
                    />
                    {error.facilityId ? (<FormHelperText>{HEALTH_FACILITY_ERROR}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
                {/* <Grid item xs={4}  style={{ paddingLeft: '10px' }}>
                  <FormControl className={classes.formControl} error={error.identifier}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Identifier"
                        required
                        value={form.identifier}
                        inputProps={{
                          name: 'identifier'
                        }}
                        onChange={this.handleChange('identifier')}
                      />
                    </ThemeProvider>
                    {error.identifier ? (<FormHelperText>{error.identifier}</FormHelperText>) : null}
                  </FormControl>
                </Grid> */}
              </Grid>
              <Grid
                container
                direction="row"
                spacing={3}
                xs={12}
                sm={12}
                className={showErrorBorder ? classNames(classes.defaultContainer, classes.borderDanger) : classes.defaultContainer}
              >
                <Grid container direction="row" xs={8} sm={8}>
                  <Grid container direction="row" spacing={3} xs={12} sm={12} className={classes.formContainer} >
                    <Grid item xs={6} sm={6}>
                      <FormControl fullWidth className={classes.formControlInput} error ={error.surName}>
                        <ThemeProvider theme={theme}>
                          <TextField
                            required
                            value={form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'?(selectedCitizen && selectedCitizen.surName ? selectedCitizen.surName : '') : form.surName}
                            label="Surname"
                            disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}
                            inputProps={{
                              name: 'surName'
                            }}
                            onChange={this.handleChange('surName')}
                          />
                        </ThemeProvider>
                        <FormHelperText>{error.surName}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <FormControl fullWidth className={classes.formControlInput} error = {error.postNames}>
                        <ThemeProvider theme={theme}>
                          <TextField
                            required
                            value={form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT' ? (selectedCitizen && selectedCitizen.postNames ? selectedCitizen.postNames : '') : form.postNames}
                            label="Post-Names"                        
                            disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}
                            inputProps={{
                              name: 'postNames'
                            }}
                            onChange={this.handleChange('postNames')}
                          />
                        </ThemeProvider>
                        <FormHelperText>{error.postNames}</FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid container direction="row" spacing={3} xs={12} sm={12} className={classes.formContainer}>
                    {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT' ? (
                    <>
                     <Grid item xs={6} sm={6}>
                      <FormControl fullWidth className={classes.formControlInput}>
                        <ThemeProvider theme={theme}>
                          <TextField
                            required
                            value={selectedCitizen && selectedCitizen.dateOfBirth ? selectedCitizen.dateOfBirth : ''}
                            label="Date of Birth"
                            InputProps={{
                              readOnly: true,
                            }}
                            disabled
                          />
                        </ThemeProvider>
                      </FormControl>
                    </Grid>
                    </>
                    ):(
                    <>
                    <Grid item xs={6} sm={6}>                      
                      <FormControl className={classes.formControl} error={error.dateOfBirth}>               
                        <ThemeProvider theme={theme}>
                          <MuiPickersUtilsProvider utils={MomentUtils}>
                            <DatePicker
                              required
                              format={DATE_FORMAT}
                              label="Date of Birth"
                              value={form.dateOfBirth  ? form.dateOfBirth : null}
                              onChange={(date) => this.handleDateChange('dateOfBirth', date)}
                              animateYearScrolling={false}
                              fullWidth
                              maxDate={moment().subtract(18, 'years')}
                            />
                          </MuiPickersUtilsProvider>                      
                        </ThemeProvider>
                        <FormHelperText>{error.dateOfBirth}</FormHelperText>
                      </FormControl>
                    </Grid>
                    </>
                    )}
                    <Grid item xs={6} sm={6}>
                      <FormControl fullWidth className={classes.formControlSelectInner} error={error.maritalStatus}>
                        <ThemeProvider theme={theme}>
                          <InputLabel>
                      Marital Status
                            <span style={{ color: '#db3131' }}>*</span>
                          </InputLabel>
                          <Select
                            value={form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT' ? (selectedCitizen && selectedCitizen.maritalStatus ? selectedCitizen.maritalStatus : '') : form.maritalStatus}
                            disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}
                            inputProps={{
                              name: 'maritalStatus'
                            }}
                            onChange={this.handleChange('maritalStatus')}
                          >
                            <MenuItem value="SINGLE">Single</MenuItem>
                            <MenuItem value="MARRIED">Married</MenuItem>
                            <MenuItem value="WIDOWED">Widowed</MenuItem>
                          </Select>
                        </ThemeProvider>
                        <FormHelperText>{error.maritalStatus}</FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid container direction="row" spacing={3} xs={12} sm={12} className={classes.formContainer}>
                    <Grid item xs={6} sm={6}>
                      <FormControl fullWidth className={classes.formControlSelectInner} error={error.sex}>
                        <ThemeProvider theme={theme}>
                          <InputLabel>
                      Sex
                            <span style={{ color: '#db3131' }}>*</span>
                          </InputLabel>
                          <Select
                            value={form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT' ? (selectedCitizen && selectedCitizen.sex ? selectedCitizen.sex : '') : form.sex}
                            disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}
                            inputProps={{
                              name: 'sex'
                            }}
                            onChange={this.handleChange('sex')}
                          >
                            <MenuItem value="MALE">Male</MenuItem>
                            <MenuItem value="FEMALE">Female</MenuItem>
                          </Select>
                        </ThemeProvider>
                        <FormHelperText>{error.sex}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <FormControl fullWidth className={classNames(classes.formControlInput, classes.formInputPadding)} error={error.nationality}>
                        <ThemeProvider theme={theme}>
                          <TextField
                            required
                            label="Nationality"
                            value= {selectedCitizen && selectedCitizen.nationality ? getNationality(selectedCitizen.nationality) : getNationality(form.nationality)}
                            disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}
                            inputProps={{
                              name: 'nationality'
                            }}
                            onChange={this.handleChange('nationality')}
                          />
                        </ThemeProvider>
                        <FormHelperText>{error.nationality}</FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container direction="row" spacing={3} xs={4} sm={4} style={{ marginTop: '0.625rem' }}>
                  <div style={{
                    height: 150, width: 140, margin: 'auto', border: '1px dashed black'
                  }}
                  >
                    <img
                      style={{ width: '100%', height: '100%' }}
                      src={`${URL.ASSET_URL}${citizenPhotoUrl}`}
                      alt={selectedCitizen && selectedCitizen.surName}
                      onError={(e) => { e.target.src = defaultUserImg; }}
                    />
                  </div>
                </Grid>
                <Grid container direction="row" spacing={3} xs={12} sm={12} className={classes.formContainer} />
                <Grid container direction="row" spacing={3} xs={12} sm={12} className={classes.formContainer}>
                  <Grid item xs={4} sm={4}>
                    <FormControl fullWidth className={classes.formControlInput} error={error.documentNumber}>
                      <ThemeProvider theme={theme}>
                        <TextField
                          required
                          label="Document Number"
                          value={selectedCitizen && selectedCitizen.documentNumber ? selectedCitizen.documentNumber : form.documentNumber}
                          disabled = {(form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT') || id}
                          onChange={this.handleChange('documentNumber')}                          
                        />
                      </ThemeProvider>
                      <FormHelperText>{error.documentNumber}</FormHelperText>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={4} sm={4}>
                    <FormControl fullWidth className={classes.formControlInput}>
                      <ThemeProvider theme={theme}>
                        <TextField
                          required = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                          label="Country"
                          value={selectedCitizen && selectedCitizen.domicileCountry ? selectedCitizen.domicileCountry : form.domicileCountry}
                          disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}
                          onChange={this.handleChange('domicileCountry')}
                        />
                      </ThemeProvider>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <FormControl fullWidth className={classes.formControlInput}>
                      <ThemeProvider theme={theme}>
                        <TextField
                          required = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                          label="Province"
                          value={selectedCitizen && selectedCitizen.domicileProvince ? selectedCitizen.domicileProvince : form.domicileProvince}
                          disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}
                          onChange={this.handleChange('domicileProvince')}
                        />
                      </ThemeProvider>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container direction="row" spacing={3} xs={12} sm={12} className={classes.formContainer}>
                  <Grid item xs={4} sm={4}>
                    <FormControl fullWidth className={classes.formControlInput}>
                      <ThemeProvider theme={theme}>
                        <TextField
                          required = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                          label="District"
                          value={selectedCitizen && selectedCitizen.domicileDistrict ? selectedCitizen.domicileDistrict : form.domicileDistrict}
                          disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                          onChange={this.handleChange('domicileDistrict')}                       
                      />
                      </ThemeProvider>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <FormControl fullWidth className={classes.formControlInput}>
                      <ThemeProvider theme={theme}>
                        <TextField
                          required = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                          label="Sector"
                          value={selectedCitizen && selectedCitizen.domicileSector ? selectedCitizen.domicileSector : form.domicileSector}
                          disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'} 
                          onChange={this.handleChange('domicileSector')}                         
                        />
                      </ThemeProvider>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4} sm={4}>
                    <FormControl fullWidth className={classes.formControlInput}>
                      <ThemeProvider theme={theme}>
                        <TextField
                          required = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                          label="Cell"
                          value={selectedCitizen && selectedCitizen.domicileCell ? selectedCitizen.domicileCell : form.domicileCell}                  
                          disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'} 
                          inputProps={{
                            name: 'domicileCell'
                          }}
                          onChange={this.handleChange('domicileCell')}                        
                        />
                      </ThemeProvider>
                    </FormControl>
                  </Grid>
                  <Grid container direction="row" spacing={3} xs={12} sm={12} className={classes.formContainer}>
                    <Grid item xs={4} sm={4}>
                      <FormControl fullWidth className={classes.formControlInput}>
                        <ThemeProvider theme={theme}>
                          <TextField
                            required = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                            label="Village"
                            value={selectedCitizen && selectedCitizen.domicileVillage ? selectedCitizen.domicileVillage : form.domicileVillage}
                            disabled = {form.documentType !== 'FOREIGN_ID' && form.documentType !== 'PASSPORT'}  
                            inputProps={{
                              name: 'domicileVillage'
                            }}
                            onChange={this.handleChange('domicileVillage')}                      
                            />
                        </ThemeProvider>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container direction="row" spacing={3} style={{ marginTop: '0.625rem' }}>
                <Grid item xs={12} sm={4}>
                  <FormControl className={classes.formControl} error={error.phoneNumber}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Telephone Number"
                        required
                        minlength="10"
                        maxlength="15"
                        value={form.phoneNumber}
                        inputProps={{
                          name: 'phoneNumber'
                        }}
                        onChange={this.handleChange('phoneNumber')}
                      />
                    </ThemeProvider>
                    {error.phoneNumber ? (<FormHelperText>{error.phoneNumber}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl className={classes.formControl} error={error.email}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Email"
                        required
                        value={form.email}
                        inputProps={{
                          name: 'email'
                        }}
                        onChange={this.handleChange('email')}
                      />
                    </ThemeProvider>
                    {error.email ? (<FormHelperText>{error.email}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl className={classes.formControl} error={error.licenseNumber}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="License Number"
                        value={form.licenseNumber}
                        required
                        inputProps={{
                          name: 'licenseNumber'
                        }}
                        onChange={this.handleChange('licenseNumber')}
                      />
                    </ThemeProvider>
                    {error.licenseNumber ? (<FormHelperText>{LICENSE_NUMBER_ERROR}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" spacing={3} style={{ marginTop: '0.625rem' }}> 
                <Grid item xs={12} sm={4}>
                  <FormControl className={classes.formControl} error={error.licenseExpiryDate}>                  
                    <ThemeProvider theme={theme}>
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <DatePicker
                          required
                          format={DATE_FORMAT}
                          label="License Number Expiry date"
                          value={form.licenseExpiryDate  ? form.licenseExpiryDate : null}
                          onChange={(date) => this.handleDateChange('licenseExpiryDate', date)}
                          animateYearScrolling={false}
                          fullWidth
                          minDate={moment()}
                        />
                      </MuiPickersUtilsProvider>                      
                    </ThemeProvider>
                    {error.licenseExpiryDate ? (<FormHelperText>{error.licenseExpiryDate}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl className={classes.formControl} error={error.qualification} fullWidth>
                    <ThemeProvider theme={theme}>
                      <div style={{"padding-bottom":"50px"}}>
                          <InputLabel>Qualification</InputLabel>
                      </div>
                      <ReactSelect
                        // isClearable
                        value={selectedQualificaton}
                        name="qualification"
                        options={qualificationsList}
                        onChange={(selected) => { this.handleChangeSelect(selected, 'qualification'); }}
                        className="basic-multi-select"
                        classNamePrefix="select"
                      />
                    </ThemeProvider>
                    {error.qualification ? (<FormHelperText>{QUALIFICATION_ERROR}</FormHelperText>) : null}
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSubmit} color="primary" variant="contained" disabled={!hasUpdateHappened}>
              Submit
            </Button>
            <Button onClick={this.handleFormClose} color="primary" variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <SuccessAlert
          message={alertMessage}
          open={showScuccessModel}
          onClose={this.handleAlertClose}
        />
        <ErrorAlert
          message={alertMessage}
          open={showErrorModel}
          onClose={() => {
            this.setState({
              showErrorModel: false,
              alertMessage: ''
            });
          }}
        />
        <ConfirmationAlert
          message={confirmAlertMessage}
          open={showConfirmModel}
          onClose={this.handleAlertConfirmationClose}
          onConfirm={this.handleConfirm}
          onCancel={this.handleAlertConfirmationClose}
        />
        <LoadingAlert
          open={showLoadingModel}
        />
      </div>
    );
  }
}

NurseCreateModel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleFetchProvinces: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  handleUpdateNurse: PropTypes.func.isRequired,
  handleCreateNurse: PropTypes.func.isRequired,
  provinces: PropTypes.array,
  districts: PropTypes.array,
  sectors: PropTypes.array,
  handleFetchDistricts: PropTypes.func.isRequired,
  handleFetchSectors: PropTypes.func.isRequired,
  handleFetchCells: PropTypes.func.isRequired,
};

NurseCreateModel.defaultProps = {
  provinces: [],
  districts: [],
  sectors: [],
  cells: [],
  citizenLoading: false,
};

const provinceReducer = 'provinceReducer';
const districtReducer = 'districtReducer';
const sectorReducer = 'sectorReducer';
const cellReducer = 'cellReducer';
const citizenReducer = 'citizenReducer';
const nurseReducer = 'nurseReducer';

const mapStateToProps = state => ({
  citizenLoading: state.get(citizenReducer) && state.get(citizenReducer).loading ? state.get(citizenReducer).loading : false,
  citizen: state.get(citizenReducer) && state.get(citizenReducer).citizen ? state.get(citizenReducer).citizen : null,
  provinces: state.get(provinceReducer) && state.get(provinceReducer).provinces ? state.get(provinceReducer).provinces : [],
  districts: state.get(districtReducer) && state.get(districtReducer).districts ? state.get(districtReducer).districts : [],
  sectors: state.get(sectorReducer) && state.get(sectorReducer).sectors ? state.get(sectorReducer).sectors : [],
  cells: state.get(cellReducer) && state.get(cellReducer).cells ? state.get(cellReducer).cells : [],
  createNurseStatus: state.get(nurseReducer) && state.get(nurseReducer).createNurseStatus ? state.get(nurseReducer).createNurseStatus : '',
  updateNurseStatus: state.get(nurseReducer) && state.get(nurseReducer).updateNurseStatus ? state.get(nurseReducer).updateNurseStatus : '',
  errorMessage: state.get(nurseReducer) && state.get(nurseReducer).errorMessage ? state.get(nurseReducer).errorMessage : '',
  citizenMessage: state.get(citizenReducer) && state.get(citizenReducer).citizenMessage ? state.get(citizenReducer).citizenMessage : ''
});

const mapDispatchToProps = dispatch => ({
  handleFetchCitizen: bindActionCreators(fetchCitizen, dispatch),
  handleFetchProvinces: bindActionCreators(fetchProvinces, dispatch),
  handleFetchDistricts: bindActionCreators(fetchDistricts, dispatch),
  handleFetchSectors: bindActionCreators(fetchSectors, dispatch),
  handleFetchCells: bindActionCreators(fetchCells, dispatch),
  handleCreateNurse: bindActionCreators(createNurse, dispatch),
  handleUpdateNurse: bindActionCreators(updateNurse, dispatch),
  handleClearStore: bindActionCreators(clearCitizenStore, dispatch),
  handleClearNurseStore: bindActionCreators(clearNurseStore, dispatch),
});

const NurseCreateModelMapped = connect(
  mapStateToProps,
  mapDispatchToProps
)(NurseCreateModel);

export default withStyles(styles)(NurseCreateModelMapped);
