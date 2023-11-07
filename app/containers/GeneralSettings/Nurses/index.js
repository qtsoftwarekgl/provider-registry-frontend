import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { lightBlue } from '@material-ui/core/colors';
import { PapperBlock } from 'enl-components';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import SuccessAlert from 'enl-components/Alerts/SuccessAlert';
import ConfirmationAlert from 'enl-components/Alerts/ConfirmationAlert';
import ErrorAlert from 'enl-components/Alerts/ErrorAlert';
import Typography from '@material-ui/core/Typography';
import Type from 'enl-styles/Typography.scss';
import Divider from '@material-ui/core/Divider';
import AddIcon from '@material-ui/icons/Add';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LoadingAlert from 'enl-components/Alerts/LoadingAlert';
import _ from 'lodash';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ReactSelect from 'react-select';
import moment from 'moment';
import EnhancedTable from '../../Pages/Table/EnhancedTable';
import styles from './user-list-jss';
import {
  nursesList, deleteNurse, updateNurse, clearNurseStore
} from './nursesAction';
import NurseCreateModel from './NurseCreateModel';
import ViewModel from './ViewModel';
import API from '../../../config/axiosConfig';
import * as URL from '../../../lib/apiUrls';
import { getErrorMessage } from '../../../utils/helpers';
// import AsyncSelect from 'react-select/async';
import { userProfile } from '../../Login/authActions';
import UploadModel from './UploadModel';
// import {headers} from './exportHeaders';
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { DATE_FORMAT } from '../../../lib/constants';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import StatusChangeAlert from '../../../components/Alerts/StatusChangeAlert';
const headCells = [
  {
    id: 'createdAt', numeric: false, show: true, label: 'Registration Date'
  },
  {
    id: 'surName', numeric: false, show: true, label: 'Surame'
  },
  {
    id: 'postNames', numeric: false, show: true, label: 'Post-Names'
  },
  {
    id: 'documentType', numeric: false, show: true, label: 'Document Type'
  },
  {
    id: 'documentNumber', numeric: false, show: true, label: 'Document Number'
  },
  {
    id: 'domicileCountry', numeric: false, show: true, label: 'Country'
  },
  {
    id: 'domicileProvince', numeric: false, show: true, label: 'Province'
  },
  {
    id: 'domicileDistrict', numeric: false, show: true, label: 'District'
  },
  {
    id: 'domicileSector', numeric: false, show: true, label: 'Sector'
  },
  {
    id: 'domicileCell', numeric: false, show: true, label: 'Cell'
  },
  {
    id: 'domicileVillage', numeric: false, show: true, label: 'Village'
  },
  {
    id: 'licenseNumber', numeric: false, show: true, label: 'License Number'
  },
  {
    id: 'licenseExpiryDate', numeric: false, show: true, label: 'License Status'
  },
  {
    id: 'phoneNumber', numeric: false, show: true, label: 'Phone'
  },
  {
    id: 'email', numeric: false, show: true, label: 'Email'
  },
  {
    id: 'status', numeric: false, show: true, label: 'Status', statusType: 'switch'
  },
  {
    id: 'actions', numeric: false, show: true, isAction: true, label: 'Actions', actionType: 'edit_view_delete'
  }
];

const theme = createMuiTheme({
  palette: {
    primary: lightBlue,
  },
});

class Nurses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      showScuccessModel: false,
      showConfirmAlert: false,
      alertMessage: '',
      editData: {},
      confirmAlertMessage: '',
      id: '',
      nurseDeleteStatus: '',
      nurseList: [],
      status: '',
      showViewModel: false,
      showUploadModel: false,
      showStatusAlert: false,
      deactivateReason: '',
      viewData: {},
      licenseNumber: '',
      license_status: '',
      documentNumber: '',
      license_from_date: null,
      license_to_date: null,
      register_from_date: null,
      register_to_date: null,
      domicileCountry: '',
      domicileProvince: '',
      domicileDistrict: '',
      domicileSector: '',
      domicileCell: '',
      domicileVillage: '',
      loading: false,
      updateType: '',
      statusConfirmAlert: false,
      selectedItemId: '',
      selectedStatusValue: false,
      showLoadingModel: false,
      showErrorModel: false,
      toolTipOpen: false,
      healthFacilityOptions: [],
      selectedhf: null,
      surName: '',
      postNames: '',
    };
  }

  componentDidMount() {
    const {
      handleNursesList
    } = this.props;
    handleNursesList({page:'1',limit:'20'});
    this.getHealthFacility();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const updatedState = {};
    const { selectedStatusValue, updateType } = prevState;
    const {
      updateNurseStatus, handleNursesList, handleClearStore, errorMessage, profileData, handleUserProfile
    } = nextProps;
    let callList = false;
    if (updateType === 'STATUS_UPDATE') {
      if (updateNurseStatus === 'ok') {
        updatedState.showLoadingModel = false;
        updatedState.showScuccessModel = true;
        updatedState.alertMessage = `Status updated to ${selectedStatusValue ? 'Active' : 'Inactive'}`;
        updatedState.updateType = '';
        handleClearStore();
        callList = true;
      } else if (updateNurseStatus === 'error') {
        updatedState.showLoadingModel = false;
        updatedState.showErrorModel = true;
        if (errorMessage) {
          updatedState.alertMessage = `Unable to update status to ${selectedStatusValue ? 'Active' : 'Inactive'}. ${getErrorMessage(errorMessage)}`;
        } else {
          updatedState.alertMessage = `Unable to update status to ${selectedStatusValue ? 'Active' : 'Inactive'}`;
        }
        updatedState.updateType = '';
        handleClearStore();
        callList = true;
      }
    }
    if (nextProps.loading !== prevState.loading) {
      updatedState.loading = nextProps.loading;
    }
    if (nextProps.nurseDeleteStatus === 'ok' && nextProps.nurseDeleteStatus !== prevState.nurseDeleteStatus) {
      updatedState.showScuccessModel = true;
      updatedState.showLoadingModel = false;
      callList = true;
      updatedState.nurseDeleteStatus = nextProps.nurseDeleteStatus;
      updatedState.alertMessage = 'Nurse deleted successfully.';
    }
    if (callList) {
      const {
        page,
        limit,
        surName,
        postNames,
        facilityName,
        licenseNumber,
        license_status,
        documentNumber,
        license_from_date,
        license_to_date,
        register_from_date,
        register_to_date,
        domicileCountry,
        domicileProvince,
        domicileDistrict,
        domicileSector,
        domicileCell,
        domicileVillage,
        status
      } = prevState;
      const params = {
        page,
        limit,
        surName,
        postNames,
        facilityName,
        licenseNumber,
        license_from_date,
        license_to_date,
        register_from_date,
        register_to_date,
        domicileCountry,
        domicileProvince,
        domicileDistrict,
        domicileSector,
        domicileCell,
        domicileVillage,
        license_status,
        documentNumber,
        status
      };
      handleNursesList(params);
    }
    if (nextProps.nurses !== prevState.nurseList) {
      updatedState.nurseList = nextProps.nurses;
    }
    if (!profileData) {
      handleUserProfile();
    } else {
      updatedState.profileData = profileData;
      if (profileData.role === 'VIEWER') {
        headCells[6].show = false; // Status
        headCells[7].actionType = 'view'; // Actions
      }
    }
    return updatedState;
  }

  handleOpenCreateModel = () => {
    this.setState({
      showCreateModel: true
    });
  }

  handleConfirmRevert = (reason) => {
    this.setState({
      deactivateReason: reason,
      statusConfirmAlert: true,
      showStatusAlert: false,
    });
  }

  handleAction = (action, rowData) => {
    if (action === 'delete') {
      this.setState({
        showConfirmAlert: true,
        confirmAlertMessage: 'Do you want to delete this record?',
        id: rowData._id
      });
    } else if (action === 'edit') {
      this.setState({
        showCreateModel: true,
        editData: rowData
      });
    } else if (action === 'view') {
      const { nurseList } = this.state;
      const data = _.find(nurseList, (list) => list._id === rowData._id);
      this.setState({
        showViewModel: true,
        viewData: data
      });
    }
  }

  handleOnStatusConfirm = () => {
    const { handleNurseUpdate } = this.props;
    const { selectedItemId, selectedStatusValue, deactivateReason } = this.state;
    const status = selectedStatusValue ? 'ACTIVE' : 'INACTIVE';
    handleNurseUpdate(selectedItemId, { status, deactivateReason });
    this.setState({
      showLoadingModel: true,
      deactivateReason: '',
      statusConfirmAlert: false,
      updateType: 'STATUS_UPDATE'
    });
  }

  handleStatusChange = (rowData, value) => {
    const statusChange = value === true ? this.setState({showStatusAlert: false, statusConfirmAlert: true}) : this.setState({showStatusAlert: true, statusConfirmAlert: false})
    this.setState({
      selectedItemId: rowData._id,
      selectedStatusValue: value,
      statusChange
    });
  }

  handleStatusAlertClose = () => {
    this.setState({
      showStatusAlert: false,
      deactivateReason: ''
    });
  }

  handleErrorAlertClose = () => {
    this.setState({ showErrorModel: false, alertMessage: '' });
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  getHealthFacility = async (value) => {
    const params = {};
    if (value) {
      params.name = value;
    }
    const { healthFacilityOptions } = this.state;
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
    if (!_.isEmpty(healthFacilityOptions)) {
      _.each(healthFacilityOptions, (item) => {
        healthFacilityOptions.push(item);
      });
    }
    return healthFacilityOptions;
  }

  handleChangeSelect=async (selected) => {
    const flist = selected.label.split('-')[0].trim();
    this.setState({
      selectedhf: selected,
      facilityName: flist,
    });
    return selected;
  }

  clearFilter = () => {
    this.setState({
      surName: '',
      postNames: '',
      facilityName: '',
      selectedhf: null,
      licenseNumber: '',
      license_status: '',
      documentNumber: '',
      license_from_date: null,
      license_to_date: null,
      register_from_date: null,
      register_to_date: null,
      domicileCountry: '',
      domicileProvince: '',
      domicileDistrict: '',
      domicileSector: '',
      domicileCell: '',
      domicileVillage: '',
      status: ''
    });
    const {
      handleNursesList
    } = this.props;
    handleNursesList();
  }

  handleAlertConfirmationClose = () => {
    this.setState({ showConfirmAlert: false });
  }

  handleConfirm = async () => {
    const { handleDeleteNurse } = this.props;
    const { id } = this.state;
    this.setState({
      showConfirmAlert: false,
      showLoadingModel: true,
      updateType: 'STATUS_DELETE'
    });
    handleDeleteNurse(id);
  }

  handleAlertClose = () => {
    this.setState({
      id: '',
      showScuccessModel: false
    });
  }

  handlePageChange = (newPage) => {
    const { handleNursesList } = this.props;
    const {
      surName,
      postNames,
      facilityName,
      licenseNumber,
      license_status,
      documentNumber,
      license_from_date,
      license_to_date,
      register_from_date,
      register_to_date,
      domicileCountry,
      domicileProvince,
      domicileDistrict,
      domicileSector,
      domicileCell,
      domicileVillage,
      status,
    } = this.state;
    const params = {
      limit: 20,
      page: newPage
    };
    if (surName) {
      params.surName = surName;
    }
    if(postNames) {
      params.postNames = postNames;
    }
    if (facilityName) {
      params.facilityName = facilityName;
    }
    if (licenseNumber) {
      params.licenseNumber = licenseNumber;
    }
    if (license_status) {
      params.license_status = license_status;
    }
    if (documentNumber) {
      params.documentNumber = documentNumber;
    }
    if (status) {
      params.status = status !== 'All' ? status : '';
    }
    if (license_from_date) {
      params.license_from_date = moment(license_from_date).format('YYYY-MM-DD');
    }
    if (license_to_date) {
      params.license_to_date = moment(license_to_date).format('YYYY-MM-DD');
    }
    if (register_from_date) {
      params.register_from_date = moment(register_from_date).format('YYYY-MM-DD');
    }
    if (register_to_date) {
      params.register_to_date = moment(register_to_date).format('YYYY-MM-DD');
    }
    if (domicileCountry) {
      params.domicileCountry = domicileCountry;
    }
    if (domicileProvince) {
      params.domicileProvince = domicileProvince;
    }
    if (domicileDistrict) {
      params.domicileDistrict = domicileDistrict;
    }
    if (domicileSector) {
      params.domicileSector = domicileSector;
    }
    if (domicileCell) {
      params.domicileCell = domicileCell;
    }
    if (domicileVillage) {
      params.domicileVillage = domicileVillage;
    }
    handleNursesList(params);
    this.setState({
      page: newPage
    });
  }

  handleSearch = () => {
    const {
      surName,
      postNames,
      facilityName,
      licenseNumber,
      license_status,
      documentNumber,
      license_from_date,
      license_to_date,
      register_from_date,
      register_to_date,
      domicileCountry,
      domicileProvince,
      domicileDistrict,
      domicileSector,
      domicileCell,
      domicileVillage,
      status
    } = this.state;
    const params = {};
    if (surName) {
      params.surName = surName;
    }
    if (postNames) {
      params.postNames = postNames;
    }
    if (facilityName) {
      params.facilityName = facilityName;
    }
    if (licenseNumber) {
      params.licenseNumber = licenseNumber;
    }
    if (license_status) {
      params.license_status = license_status !== 'All' ? license_status : '';
    }
    if (documentNumber) {
      params.documentNumber = documentNumber;
    }
    if (status) {
      params.status = status !== 'All' ? status : '';
    }
    if (license_from_date) {
      params.license_from_date = moment(license_from_date).format('YYYY-MM-DD');
    }
    if (license_to_date) {
      params.license_to_date = moment(license_to_date).format('YYYY-MM-DD');
    }
    if (register_from_date) {
      params.register_from_date = moment(register_from_date).format('YYYY-MM-DD');
    }
    if (register_to_date) {
      params.register_to_date = moment(register_to_date).format('YYYY-MM-DD');
    }
    if (domicileCountry) {
      params.domicileCountry = domicileCountry;
    }
    if (domicileProvince) {
      params.domicileProvince = domicileProvince;
    }
    if (domicileDistrict) {
      params.domicileDistrict = domicileDistrict;
    }
    if (domicileSector) {
      params.domicileSector = domicileSector;
    }
    if (domicileCell) {
      params.domicileCell = domicileCell;
    }
    if (domicileVillage) {
      params.domicileVillage = domicileVillage;
    }
    if (!_.isEmpty(params)) {
      const { handleNursesList } = this.props;
      handleNursesList(params);
    } else {
      this.setState({ toolTipOpen: true });
    }
  }

  importCsv = async () => {
    this.setState({ showUploadModel: true });
  }

  exportCsv = async () => {
    // const hiddenElement = document.createElement('a');
    // hiddenElement.href = "/doc/template.xlsx";
    // hiddenElement.target = '_blank';
    // hiddenElement.download = `template.xlsx`;
    // hiddenElement.click();
    
    let Heading = [['_id', 'documentType', 'documentNumber', 'surName', 'postNames', 'dateOfBirth', 'maritalStatus', 'sex',
                  'nationality', 'domicileCountry', 'domicileProvince', 'domicileDistrict', 'domicileSector', 'domicileCell', 
                'domicileVillage', 'licenseNumber', 'license_status', 'qualification', 'email', 'phoneNumber', 'status', 'applicationNumber', 'nin', 'nid',
              'fatherName', 'motherName', 'countryOfBirth', 'villageId', 'civilStatus', 'spouse', 'applicantType', 'licenseExpiryDate', 'FacilityId']];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, [], { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'template.xlsx');
  }

  downloadDataCsv = async (headers) => {
    const {
      page,
      surName,
      postNames,
      facilityName,
      license_status,
      licenseNumber,
      documentNumber,
      license_from_date,
      license_to_date,
      register_from_date,
      register_to_date,
      domicileCountry,
      domicileProvince,
      domicileDistrict,
      domicileSector,
      domicileCell,
      domicileVillage,
      status
    } = this.state;
    const params = {
      limit: 100000,
      page: page
    };
    if (surName) {
      params.surName = surName;
    }
    if (postNames) {
      params.postNames = postNames;
    }
    if (facilityName) {
      params.facilityName = facilityName;
    }
    if (licenseNumber) {
      params.licenseNumber = licenseNumber;
    }
    if (license_status) {
      params.license_status = license_status !== 'All' ? license_status : '';
    }
    if (documentNumber) {
      params.documentNumber = documentNumber;
    }
    if (status && status !== 'All') {
      params.status = status;
    }
    if (license_from_date) {
      params.license_from_date = moment(license_from_date).format('YYYY-MM-DD');
    }
    if (license_to_date) {
      params.license_to_date = moment(license_to_date).format('YYYY-MM-DD');
    }
    if (register_from_date) {
      params.register_from_date = moment(register_from_date).format('YYYY-MM-DD');
    }
    if (register_to_date) {
      params.register_to_date = moment(register_to_date).format('YYYY-MM-DD');
    }
    if (domicileCountry) {
      params.domicileCountry = domicileCountry;
    }
    if (domicileProvince) {
      params.domicileProvince = domicileProvince;
    }
    if (domicileDistrict) {
      params.domicileDistrict = domicileDistrict;
    }
    if (domicileSector) {
      params.domicileSector = domicileSector;
    }
    if (domicileCell) {
      params.domicileCell = domicileCell;
    }
    if (domicileVillage) {
      params.domicileVillage = domicileVillage;
    }
    params.skipPagination = true;
    this.setState({
      showLoadingModel: true,
    });
    const res = await API.get(URL.NURSES, { data: {}, params })
      .then(async (response) => response)
      .catch((error) => {
        console.log(error);
      });
    if(res.status === 'error') {
      let message = res && res.data ? res.data + res.message : res.message
      this.setState({
        showLoadingModel: false,
        showErrorModel : true,
        alertMessage : message
      });
    }
    if(res.status === 'ok') {
      const heading = [];
      const keys = [];
      headers.forEach((row) => {
        if (row.show && row.id !== 'actions') {
          if(row.label === 'License Status'){        
            heading.push('License Expiry Date');
          } else{
            heading.push(row.label);      
          }
          keys.push(row.id);
        }
      });
      let csv = heading.join(',');
      csv += '\n';
      res.data.forEach((row) => {
        const formatData = [];
        keys.forEach(key => {
          let value = '';
          if (key === 'licenseExpiryDate' || key === 'createdAt') {
            if(row[key]!= null){
              value = moment(row[key]).format(DATE_FORMAT);
            } else {
              value = 'N/A';
            }
          } else {
            value = row[key];
          }
          if (value) {
            formatData.push(value);
          } else {
            formatData.push('N/A');
          }
        });
        csv += formatData.join(',');
        csv += '\n';
      });
      const hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = `providers-${+new Date()}.csv`;
      hiddenElement.click();
      this.setState({
        showLoadingModel: false,
      });
    }
  }


  handleTooltipClose = () => {
    this.setState({ toolTipOpen: false });
  };

  handleDateChange = (name, date) => {
    const stateCopy = _.cloneDeep(this.state);
    const dateCopy = new Date(date);
    if(name === 'license_from_date'){
      dateCopy.setDate(dateCopy.getDate() + 1);
      stateCopy.license_from_date= date;
      stateCopy.license_to_date= dateCopy;
      this.setState(stateCopy);
    }
    if(name === 'license_to_date'){
      stateCopy.license_to_date= date;
      this.setState(stateCopy);
    }
    if(name === 'register_from_date'){
      dateCopy.setDate(dateCopy.getDate() + 1);
      stateCopy.register_from_date= date;
      stateCopy.register_to_date= dateCopy;
      this.setState(stateCopy);
    }
    if(name === 'register_to_date'){
      stateCopy.register_to_date= date;
      this.setState(stateCopy);
    }
  }

  render() {
    const { classes, count, profileData } = this.props;
    const {
      page,
      showCreateModel,
      surName,
      postNames,
      facilityName,
      licenseNumber,
      license_status,
      documentNumber,
      status,
      license_from_date,
      license_to_date,
      register_from_date,
      register_to_date,
      domicileCountry,
      domicileProvince,
      domicileDistrict,
      domicileSector,
      domicileCell,
      domicileVillage,
      confirmAlertMessage,
      showConfirmAlert,
      alertMessage,
      showScuccessModel,
      showViewModel,
      showUploadModel,
      viewData,
      nurseList,
      editData,
      loading,
      selectedStatusValue,
      statusConfirmAlert,
      showStatusAlert,
      showLoadingModel,
      showErrorModel,
      toolTipOpen,
      healthFacilityOptions,
      selectedhf
    } = this.state;
    // if (_.isEmpty(healthFacilityOptions)) {
    //   this.getHealthFacility();
    // }

    return (
      <div>
        <PapperBlock whiteBg hideBlockSection title="Health Facilities" desc="Health">
          <Typography variant="h5" className={Type.textLeft} gutterBottom>
            <span>Providers</span>
            {profileData && profileData.role !== 'VIEWER' ? (
              <Button
                onClick={this.handleOpenCreateModel}
                className={classes.buttonAddNew}
                variant="contained"
                color="secondary"
                size="small"
              >
              Add New
                {' '}
                <AddIcon />
              </Button>
            ) : null}
          </Typography>
          <Divider />
          <Grid container spacing={1}>
            <Grid container item xs={12} sm={9}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Surname"
                        value={surName}
                        inputProps={{
                          name: 'surName'
                        }}
                        onChange={this.handleChange}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Post-Names"
                        value={postNames}
                        inputProps={{
                          name: 'postNames'
                        }}
                        onChange={this.handleChange}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                      <ThemeProvider theme={theme}>
                        <div style={{ 'padding-bottom': '40px' }}>
                          <InputLabel>Health Facility</InputLabel>
                        </div>
                        <ReactSelect
                          // isClearable
                          value={selectedhf}
                          name="facilityName"
                          options={healthFacilityOptions}
                          onChange={(selected) => { this.handleChangeSelect(selected); }}
                          className="basic-multi-select"
                          classNamePrefix="select"
                        />
                      </ThemeProvider>
                    </FormControl>
                </Grid>               
              </Grid>
              <Grid container spacing={1}> 
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="License Number"
                        value={licenseNumber}
                        inputProps={{
                          name: 'licenseNumber'
                        }}
                        onChange={this.handleChange}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>   
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Document Number"
                        value={documentNumber}
                        inputProps={{
                          name: 'documentNumber'
                        }}
                        onChange={this.handleChange}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>             
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="status-simple">Status</InputLabel>
                    <ThemeProvider theme={theme}>
                      <Select
                        value={status}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'status',
                          id: 'status-simple',
                        }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                        {/* <MenuItem value="DELETED">Deleted</MenuItem> */}
                      </Select>
                    </ThemeProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="license-status">License Status</InputLabel>
                    <ThemeProvider theme={theme}>
                      <Select
                        value={license_status}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'license_status',
                          id: 'license-status',
                        }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="VALID">Valid</MenuItem>
                        <MenuItem value="EXPIRED">Expired</MenuItem>
                        {/* <MenuItem value="DELETED">Deleted</MenuItem> */}
                      </Select>
                    </ThemeProvider>
                  </FormControl>
                </Grid>                
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <ThemeProvider theme={theme}>
                        <DatePicker
                          label="License Expiry From Date"
                          format={DATE_FORMAT}
                          value={license_from_date ? license_from_date : null}
                          onChange={(date) =>
                            this.handleDateChange("license_from_date", date)
                          }
                          animateYearScrolling={false}
                          // maxDate={license_from_date || new Date()}
                          autoOk
                        />
                      </ThemeProvider>
                    </MuiPickersUtilsProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <ThemeProvider theme={theme}>
                        <DatePicker
                          label="License Expiry To Date"
                          format={DATE_FORMAT}
                          value={license_to_date ? license_to_date : null}
                          onChange={(date) => this.handleDateChange("license_to_date", date)}
                          animateYearScrolling={false}
                          // maxDate={license_to_date || new Date()}
                          autoOk
                        />
                      </ThemeProvider>
                    </MuiPickersUtilsProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <ThemeProvider theme={theme}>
                        <DatePicker
                          label="Registration From Date"
                          format={DATE_FORMAT}
                          value={register_from_date ? register_from_date : null}
                          onChange={(date) =>
                            this.handleDateChange("register_from_date", date)
                          }
                          animateYearScrolling={false}
                          // maxDate={register_from_date || new Date()}
                          autoOk
                        />
                      </ThemeProvider>
                    </MuiPickersUtilsProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl className={classes.formControl}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <ThemeProvider theme={theme}>
                        <DatePicker
                          label="Registration To Date"
                          format={DATE_FORMAT}
                          value={register_to_date ? register_to_date : null}
                          onChange={(date) => this.handleDateChange("register_to_date", date)}
                          animateYearScrolling={false}
                          // maxDate={register_to_date || new Date()}
                          autoOk
                        />
                      </ThemeProvider>
                    </MuiPickersUtilsProvider>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth className={classes.formControlInput}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Country"
                        value={domicileCountry ? domicileCountry : ''}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'domicileCountry'
                        }}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth className={classes.formControlInput}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Province"
                        value={domicileProvince ? domicileProvince : ''}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'domicileProvince'
                        }}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth className={classes.formControlInput}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="District"
                        value={domicileDistrict ? domicileDistrict : ''}
                        onChange={this.handleChange}    
                        inputProps={{
                          name: 'domicileDistrict'
                        }}                
                    />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth className={classes.formControlInput}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Sector"
                        value={domicileSector ? domicileSector : ''}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'domicileSector'
                        }}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={1}>                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth className={classes.formControlInput}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Cell"
                        value={domicileCell ? domicileCell : ''}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'domicileCell'
                        }}
                      />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth className={classes.formControlInput}>
                    <ThemeProvider theme={theme}>
                      <TextField
                        id="filled-basic"
                        label="Village"
                        value={domicileVillage ? domicileVillage : ''}
                        onChange={this.handleChange}  
                        inputProps={{
                          name: 'domicileVillage'
                        }}                 
                    />
                    </ThemeProvider>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid container item xs={12} sm={3} alignContent="center">
              <Grid item xs={12} sm={12} align="center" className={classes.marginY1}>
                <ClickAwayListener onClickAway={this.handleTooltipClose}>
                  <Tooltip
                    PopperProps={{
                      disablePortal: true,
                    }}
                    placement="top"
                    onClose={this.handleTooltipClose}
                    open={toolTipOpen}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title="Please enter a value for one filter and try"
                  >
                    <Button
                      onClick={() => this.handleSearch()}
                      style={{ width: 100 }}
                      variant="contained"
                      color="primary"
                      className={classes.buttonSearch}
                      size="small"
                    >
                      <span style={{ textTransform: 'capitalize' }}>Search</span>
                    </Button>
                  </Tooltip>
                </ClickAwayListener>
              </Grid>
              <Grid item xs={12} sm={12} align="center" className={classes.marginY1} m={0}>
                <Button
                  style={{ padding: 5, marginTop: 10, width: 100 }}
                  variant="outlined"
                  color="secondary"
                  size="small"
                  className={classes.buttonLink}
                  onClick={this.clearFilter}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </PapperBlock>
        <div>
          <EnhancedTable
            tableTitle="Provider"
            page={page}
            headCells={headCells}
            rows={nurseList}
            totalData={count}
            loading={loading}
            onPageChange={(newPage) => this.handlePageChange(newPage)}
            onActionClicked={(action, rowData) => this.handleAction(action, rowData)}
            handleStatusChange={(rowData, value) => this.handleStatusChange(rowData, value)}
            // download={(headers) => this.exportCsv(headers)}
            download={() => this.exportCsv()}
            upload={() => this.importCsv()}
            downloadDataCsv={(headers) => this.downloadDataCsv(headers)}
            profileData={profileData}
          />
        </div>
        <NurseCreateModel
          open={showCreateModel}
          editData={editData}
          onClose={() => {
            this.setState({
              showCreateModel: false,
              editData: {}
            });
            const { handleNursesList } = this.props;
            const params = {};
            if (surName) {
              params.surName = surName;
            }
            if (postNames) {
              params.postNames = postNames;
            }
            if (facilityName) {
              params.facilityName = facilityName;
            }
            if (licenseNumber) {
              params.licenseNumber = licenseNumber;
            }
            if (documentNumber) {
              params.documentNumber = documentNumber;
            }
            if (status) {
              params.status = status !== 'All' ? status : '';
            }
            if (license_from_date) {
              params.license_from_date = moment(license_from_date).format('YYYY-MM-DD');
            }
            if (license_to_date) {
              params.license_to_date = moment(license_to_date).format('YYYY-MM-DD');
            }
            if (register_from_date) {
              params.register_from_date = moment(register_from_date).format('YYYY-MM-DD');
            }
            if (register_to_date) {
              params.register_to_date = moment(register_to_date).format('YYYY-MM-DD');
            }
            if (domicileCountry) {
              params.domicileCountry = domicileCountry;
            }
            if (domicileProvince) {
              params.domicileProvince = domicileProvince;
            }
            if (domicileDistrict) {
              params.domicileDistrict = domicileDistrict;
            }
            if (domicileSector) {
              params.domicileSector = domicileSector;
            }
            if (domicileCell) {
              params.domicileCell = domicileCell;
            }
            if (domicileVillage) {
              params.domicileVillage = domicileVillage;
            }
            if (!_.isEmpty(params)) {
              handleNursesList(params);
            } else {
              handleNursesList();
            }
          }}
        />
        <SuccessAlert
          message={alertMessage}
          open={showScuccessModel}
          onClose={this.handleAlertClose}
        />
        <ErrorAlert
          message={alertMessage}
          open={showErrorModel}
          onClose={this.handleErrorAlertClose}
        />
        <ConfirmationAlert
          message={confirmAlertMessage}
          open={showConfirmAlert}
          onClose={this.handleAlertConfirmationClose}
          onConfirm={this.handleConfirm}
          onCancel={this.handleAlertConfirmationClose}
        />
        <ConfirmationAlert
          message={`Are you sure to ${selectedStatusValue ? 'activate' : 'deactivate'} this provider?`}
          open={statusConfirmAlert}
          onClose={() => {
            this.setState({
              selectedItemId: '',
              selectedStatusValue: '',
              deactivateReason: '',
              statusConfirmAlert: false
            });
          }}
          onConfirm={() => this.handleOnStatusConfirm()}
          onCancel={() => {
            this.setState({
              selectedItemId: '',
              selectedStatusValue: '',
              deactivateReason: '',
              statusConfirmAlert: false,
            });
          }}
        />
        <StatusChangeAlert
          message="Please enter the reason to change the status?"
          open={showStatusAlert}
          onClose={this.handleStatusAlertClose}
          onConfirm={(reason) => this.handleConfirmRevert(reason)}
          onCancel={this.handleStatusAlertClose}
        />
        <ViewModel
          open={showViewModel}
          onClose={() => {
            this.setState({ showViewModel: false });
          }}
          data={viewData}
        />
        <UploadModel
          open={showUploadModel}
          onClose={() => {
            this.setState({ showUploadModel: false });
            const { handleNursesList } = this.props;
            handleNursesList();
          }}
        />
        <LoadingAlert
          open={showLoadingModel}
        />
      </div>
    );
  }
}

Nurses.propTypes = {
  classes: PropTypes.object.isRequired,
  handleDeleteNurse: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
  handleNursesList: PropTypes.func.isRequired,
  handleNurseUpdate: PropTypes.func.isRequired,
  profileData: PropTypes.isRequired
};

const nurseReducer = 'nurseReducer';
const adminAuthReducer = 'adminAuthReducer';
const mapStateToProps = state => ({
  nurses: state.get(nurseReducer) && state.get(nurseReducer).nurses ? state.get(nurseReducer).nurses : [],
  count: state.get(nurseReducer) && state.get(nurseReducer).count ? state.get(nurseReducer).count : 0,
  nurseDeleteStatus: state.get(nurseReducer) && state.get(nurseReducer).nurseDeleteStatus ? state.get(nurseReducer).nurseDeleteStatus : '',
  updateNurseStatus: state.get(nurseReducer) && state.get(nurseReducer).updateNurseStatus ? state.get(nurseReducer).updateNurseStatus : '',
  errorMessage: state.get(nurseReducer) && state.get(nurseReducer).errorMessage ? state.get(nurseReducer).errorMessage : '',
  loading: state.get(nurseReducer) && state.get(nurseReducer).loading ? state.get(nurseReducer).loading : false,
  profileData: state.get(adminAuthReducer) && state.get(adminAuthReducer).profileData ? state.get(adminAuthReducer).profileData : null
});

const mapDispatchToProps = dispatch => ({
  handleNursesList: bindActionCreators(nursesList, dispatch),
  handleDeleteNurse: bindActionCreators(deleteNurse, dispatch),
  handleClearStore: bindActionCreators(clearNurseStore, dispatch),
  handleNurseUpdate: bindActionCreators(updateNurse, dispatch),
  handleUserProfile: bindActionCreators(userProfile, dispatch)
});

const NursesMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(Nurses);

export default withStyles(styles)(NursesMap);
