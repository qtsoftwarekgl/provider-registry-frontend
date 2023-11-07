import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { ThemeProvider } from "@material-ui/styles";
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import {FormControl, FormHelperText, Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import { uploadFile, uploadFileClear } from '../../App/CommonRedux/upload/actions';
// import { getErrorMessage } from '../../../utils/helpers';
import SuccessAlert from 'enl-components/Alerts/SuccessAlert';
// import ConfirmationAlert from 'enl-components/Alerts/ConfirmationAlert';
import ErrorAlert from 'enl-components/Alerts/ErrorAlert';
import LoadingAlert from 'enl-components/Alerts/LoadingAlert';
import xlsx from 'xlsx';
import { REGEX, DOCUMENT_TYPE } from '../../../lib/constants';

const fileInput = React.createRef();

const styles =() => ({
  root: {
    "& .MuiDialog-paperWidthSm": {
      maxWidth: 900,
      minWidth: 900,
    },
  },
  titleRoot: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    marginLeft: 10,
  },
  label_head: {
    fontWeight: "bold",
    fontSize: "1.125rem",
    borderBottom: "1px dashed #C0C0C0",
  },
  activeChip: {
    minWidth: 90,
    backgroundColor: "#2e8e0f",
  },
  inactiveChip: {
    minWidth: 90,
    backgroundColor: "#8c8989",
  },
  deletedChip: {
    minWidth: 90,
    backgroundColor: "#b92b2b",
  },
  table: {
    minWidth: 500,
    marginTop: 15,
  },
})
let formSubmit = false;

class UploadModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      uploadedFilePath: '',
      uploadedFileError: '',
      showLoadingModel: false,
      loadingMessage:'',
      showErrorAlert: false,
      errorAlertMessage: '',
      UploadedFileName:'',
      showScuccessModel:false,
      // confirmAlertMessage: '',
      formData:null,
      showErrorContent: ""
    }
  }
   
  static getDerivedStateFromProps(nextProps, prevState) {
    const updatedState = {};
    const {
      handleUploadFileClear,
      fileUploaded,
      message,
      fileUploadErrorMessage
    } = nextProps;
    if (fileUploaded === 'success') {
        formSubmit = true;
        updatedState.showLoadingModel = false
        updatedState.showScuccessModel = true;
        updatedState.alertMessage = message;          
        updatedState.uploadedFileError = '';
        updatedState.UploadedFileName = ''

      handleUploadFileClear();
    }
    if (fileUploaded === 'error') {
      formSubmit = true;
      updatedState.showErrorModel = true
      updatedState.errorAlertMessage = fileUploadErrorMessage
      updatedState.showLoadingModel = false
      handleUploadFileClear();
    }
    return updatedState;
  }

  handleAlertClose = () => {
    const { onClose } = this.props;
    formSubmit = false;
    // const {showScuccessModel} = this.state;
    this.setState(
     {showScuccessModel : false},
      onClose(),
    )
  }
  
  handleFormClose = () => {
    const { onClose } = this.props;
    formSubmit = false
    this.setState(
      {uploadedFileError : '', UploadedFileName : ''},
      onClose(),
  );
  }

  handleUpload = () =>{
    const { handleUploadFile } = this.props;
    const {dataToSave}=this.state;
    console.log("dataaa",dataToSave)
    this.setState({
      showLoadingModel:true,
    })
    handleUploadFile(dataToSave);
  }

  handleFileUpload = (event) => {
    const { files } = event.target;
    console.log("ASdsadsadsads");
    const format = /(\.XLSX)$/i;
    if (files) {
      const fileName = files[0].name;
      this.setState({
        UploadedFileName:fileName
      })
      if (format.exec(fileName)) {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        console.log("event.target.files[0]--",event.target.files[0])
        this.setState({
          formData:formData
        })
      } else {
        event.target.value = ''; // eslint-disable-line
        this.setState({
          // showErrorAlert: true,
          uploadedFileError: 'Please select a valid file. Only xlsx are allowed.',
        });
      }
    } else {
      this.setState({
        // showErrorAlert: true,
        uploadedFileError: 'Please select a valid file.',
      });
    }
  }

  readUploadFile = (e) => {
    e.preventDefault();
    const { files } = event.target;
    const format = /(\.XLSX)$/i;
    if (files) {
      const fileName = files[0].name;
      this.setState({
        UploadedFileName:fileName,
        showLoadingModel:true,
        loadingMessage:"Please Wait! Data is Validating..."
      })
    } else {
      this.setState({
        // showErrorAlert: true,
        uploadedFileError: 'Please select a valid file.',
      });
    }
    if (e.target.files) {
      console.log("dasdsadsadss", e.target.files)
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = xlsx.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const excelData = xlsx.utils.sheet_to_json(worksheet);
            const dataToSave = [];
            const validData = [];
            const invalidData = [];
            const resultData = {
              totalRecords: excelData.length,
              validData: [],
              invalidData: [],
            };
            if (excelData.length) {
              this.setState({
                showLoadingModel:false,
              })
              excelData.forEach((row,index) => {
                row.phoneNumber = row.phoneNumber ? "0"+ row.phoneNumber : row.phoneNumber;
                let data = {rowData: {},errorFields: []};
                // VALIDATIONS FOR FOREIGNER AND PASSPORT 
                if (row.documentType === "FOREIGNER" || row.documentType === "PASSPORT") {
                  data.rowData = row;
                  if ((!row.surName || !REGEX.NAME.test(row.surName))) {
                    data.errorFields.push({field: 'surName', error: 'Please enter valid surName!'});
                  }
                  if ((!row.postNames || !REGEX.NAME.test(row.postNames))) {
                    data.errorFields.push({field: 'postNames', error: 'Please enter valid postNames!'});
                  }
                  if ((!row.nationality || !REGEX.NAME.test(row.nationality))) {
                    data.errorFields.push({field: 'nationality', error: 'Please enter valid nationality!'});
                  }
                  if ((!row.sex || !REGEX.NAME.test(row.sex))) {
                    data.errorFields.push({field: 'sex', error: 'Please enter valid sex!'});
                  }
                  if ((!row.maritalStatus || !REGEX.NAME.test(row.maritalStatus))) {
                    data.errorFields.push({field: 'maritalStatus', error: 'Please enter valid maritalStatus!'});
                  }
                  if (!row.documentNumber) {
                    data.errorFields.push({field: 'documentNumber', error: 'Please enter valid documentNumber!'});
                  }
                  if ((!row.FacilityId || !REGEX.NUMBER.test(row.FacilityId))) {
                    data.errorFields.push({field: 'FacilityId', error: 'Please enter valid FacilityId!'});
                  }
                  if ((!row.dateOfBirth)) {
                    data.errorFields.push({field: 'dateOfBirth', error: 'Please enter valid dateOfBirth!'});
                  }
                  if ((!row.licenseExpiryDate)) {
                    data.errorFields.push({field: 'licenseExpiryDate', error: 'Please enter valid licenseExpiryDate!'});
                  }
                } else { // FOR OTHER DOC TYPES VALIDATIONS
                  data.rowData = row;
                  if ((!row.surName || !REGEX.NAME.test(row.surName))) {
                    data.errorFields.push({field: 'surName', error: 'Please enter valid surName!'});
                  }
                  if ((!row.postNames || !REGEX.NAME.test(row.postNames))) {
                    data.errorFields.push({field: 'postNames', error: 'Please enter valid postNames!'});
                  }
                  if ((!row.nationality || !REGEX.NAME.test(row.nationality))) {
                    data.errorFields.push({field: 'nationality', error: 'Please enter valid nationality!'});
                  }
                  if ((!row.sex || !REGEX.NAME.test(row.sex))) {
                    data.errorFields.push({field: 'sex', error: 'Please enter valid sex!'});
                  }
                  if ((!row.maritalStatus || !REGEX.NAME.test(row.maritalStatus))) {
                    data.errorFields.push({field: 'maritalStatus', error: 'Please enter valid maritalStatus!'});
                  }
                  if ((!row.documentType || !DOCUMENT_TYPE.includes(row.documentType))) {
                    data.errorFields.push({field: 'documentType', error: 'Invalid documentType - ' + row.documentType + ' Please enter valid documentType'});
                  }
                  else if ((row.documentType && row.documentType !== 'FOREIGN_ID' && row.documentType !== 'PASSPORT') && (!row.documentNumber || !REGEX.NUMBER.test(row.documentNumber))) {
                    data.errorFields.push({field: 'documentNumber', error: 'Please enter valid documentNumber!'});
                  }
                  if ((!row.dateOfBirth)) {
                    data.errorFields.push({field: 'dateOfBirth', error: 'Please enter valid dateOfBirth!'});
                  }
                  if ((!row.domicileCountry || !REGEX.NAME.test(row.domicileCountry))) {
                    data.errorFields.push({field: 'domicileCountry', error: 'Please enter valid domicileCountry!'});
                  }
                  if ((!row.domicileProvince || !REGEX.NAME.test(row.domicileProvince))) {
                    data.errorFields.push({field: 'domicileProvince', error: 'Please enter valid domicileProvince!'});
                  }
                  if ((!row.domicileDistrict || !REGEX.NAME.test(row.domicileDistrict))) {
                    data.errorFields.push({field: 'domicileDistrict', error: 'Please enter valid domicileDistrict!'});
                  }
                  if ((!row.domicileSector || !REGEX.NAME.test(row.domicileSector))) {
                    data.errorFields.push({field: 'domicileSector', error: 'Please enter valid domicileSector!'});
                  }
                  if ((!row.domicileCell || !REGEX.NAME.test(row.domicileCell))) {
                    data.errorFields.push({field: 'domicileCell', error: 'Please enter valid domicileCell!'});
                  }
                  if ((!row.domicileVillage || !REGEX.NAME.test(row.domicileVillage))) {
                    data.errorFields.push({field: 'domicileVillage', error: 'Please enter valid domicileVillage!'});
                  }


                  if ((!row.FacilityId || !REGEX.NUMBER.test(row.FacilityId))) {
                    data.errorFields.push({field: 'FacilityId', error: 'Please enter valid FacilityId!'});
                  }
                  if ((!row.licenseNumber || !REGEX.NUMBER.test(row.licenseNumber))) {
                    data.errorFields.push({field: 'licenseNumber', error: 'Please enter valid licenseNumber!'});
                  }
                  // if ((!row.qualification || !REGEX.NUMBER.test(row.qualification))) {
                  //   data.errorFields.push({field: 'qualification', error: 'Please enter valid qualification!'});
                  // }
                  if ((!row.phoneNumber || !REGEX.PHONE.test(row.phoneNumber))) {
                    data.errorFields.push({field: 'phoneNumber', error: 'Please enter valid phoneNumber!'});
                  }
                  if ((!row.email || !REGEX.EMAIL.test(row.email))) {
                    data.errorFields.push({field: 'email', error: 'Please enter valid email!'});
                  }
                  if ((!row.licenseExpiryDate)) {
                    data.errorFields.push({field: 'licenseExpiryDate', error: 'Please enter valid licenseExpiryDate!'});
                  }
                }
                data.rowData.index = index+2
                if (data.errorFields.length) {
                  invalidData.push(data);
                } else {
                  validData.push(data);
                  dataToSave.push(data.rowData)
                }
              });
              resultData.validData = validData;
              resultData.invalidData = invalidData;
              this.setState({
                resultData: resultData,
                dataToSave:dataToSave
              })
              console.log("resultData.validData => ", JSON.stringify(resultData.validData));
              console.log("resultData.validData => ", JSON.stringify(resultData.invalidData));
            }
        };
        reader.readAsArrayBuffer(e.target.files[0]);
    }
}

  render(){
    const { open, onClose, classes} = this.props;
    const {uploadedFileError,uploadedFilePath,UploadedFileName,showScuccessModel,alertMessage,resultData,showErrorContent,dataToSave,showLoadingModel,errorAlertMessage,showErrorModel,loadingMessage} = this.state;
    return (
      <React.Fragment>
              <div>
        <Dialog
          open={open}
          onClose={this.handleFormClose}
          scroll="paper"
          aria-labelledby="scroll-dialog-title"
          className={classes.root}
        >
          {/* <DialogTitle id="scroll-dialog-title" className={classes.titleRoot}>
          Provider Info
          </DialogTitle> */}
          <DialogContent>
            <Grid item xs={6}>
              <div style={{ paddingTop: 25, float: "left" }}>
                <FormControl
                  className={classes.formControlInput}
                  fullWidth
                  error={uploadedFileError !== ""}
                >
                  <ThemeProvider>
                    <input
                      style={{ display: "none" }}
                      ref={fileInput}
                      type="file"
                      onChange={this.readUploadFile}
                    />
                    {UploadedFileName}
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        fileInput.current.click();
                      }}
                    >
                      <PictureAsPdfIcon />
                      <span
                        style={{
                          paddingLeft: 10,
                          textTransform: "capitalize",
                        }}
                      >
                        Upload Document
                        {/* <span>*</span> */}
                      </span>
                    </Button>
                  </ThemeProvider>

                  {UploadedFileName && !showLoadingModel ? 
                  (<ThemeProvider>
                    <Grid container spacing={1}>
                    <Grid item xs={12} sm={12} style={{ "margin-top": "5px" }}>
                        <span style={{ color: "blue" }}>Total Records Count: {resultData && resultData.totalRecords ? resultData.totalRecords : 0}</span> 
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <span style={{ color: "green" }}>Valid Records Count: {resultData && resultData.validData.length ? resultData.validData.length : 0}</span> 
                        <button style={{ "font-size": "11px", "font-weight": 600, "margin-left": "5px" }} onClick={() => {this.setState({ showErrorContent: (showErrorContent == "success" ? "" : "success")});}}>{showErrorContent == "success" ? "Close" : "Show Details"}</button>
                        {showErrorContent == "success" ? 
                          (
                            <div style={{ "margin-top": "5px", "max-height": "330px", "overflow" : "scroll" }}>
                              {
                                resultData && resultData.validData.map((item) => (
                                  <div style={{ "border": "1px solid green", "margin-bottom": "5px", "padding": "8px" }}>
                                    <p style={{ "margin": "0px", "font-size": "13px", "font-weight": "600" }}>Document Number: {item.rowData.documentNumber}</p>
                                  </div>
                                ))
                              }
                            </div>
                          ) : null
                        }
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <span style={{ color: "red" }}>In-Valid Records Count: {resultData && resultData.invalidData.length ? resultData.invalidData.length : 0}</span> 
                        <button style={{ "font-size": "11px", "font-weight": 600, "margin-left": "5px" }} onClick={() => {this.setState({ showErrorContent: (showErrorContent == "error" ? "" : "error")});}}>{showErrorContent == "error" ? "Close" : "Show Details"}</button>
                        {showErrorContent == "error" ? 
                          (
                            <div style={{ "margin-top": "5px", "max-height": "330px", "overflow" : "scroll" }}>
                              {
                                resultData && resultData.invalidData.map((item) => (
                                  <div style={{ "border": "1px solid red", "margin-bottom": "5px", "padding": "5px" }}>
                                    <p style={{ "margin": "0px", "font-size": "13px", "font-weight": "600" }}>Document Number: {item.rowData.documentNumber}</p>
                                    <p style={{ "margin": "0px", "font-size": "13px", "font-weight": "600" }}>Row Number: {item.rowData.index}</p>
                                    <p style={{ "margin": "0px", "font-size": "13px" }}>
                                      {
                                        item && item.errorFields.map((error) => (
                                          <p style={{ "margin": "0px", "font-size": "13px" }}><span>Field: {error.field}</span><span style={{ "padding-left": "20px" }}>Error: {error.error}</span></p>
                                        ))
                                        }
                                      </p>
                                  </div>
                                ))
                              }
                            </div>
                          ) : null
                        }
                      </Grid>
                    </Grid>


                    
                  </ThemeProvider>) 
                  : null}


                  <FormHelperText>{uploadedFileError}</FormHelperText>
                </FormControl>
              </div>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleUpload} color="primary" variant="outlined" disabled={dataToSave && dataToSave.length == 0}>
              Upload
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
        {/* <ConfirmationAlert
          message={confirmAlertMessage}
          open={showConfirmModel}
          onClose={this.handleAlertConfirmationClose}
          onConfirm={this.handleConfirm}
          onCancel={this.handleAlertConfirmationClose}
        /> */}
        <LoadingAlert
          open={showLoadingModel}
          message={loadingMessage ? loadingMessage : ''}
        />
        <ErrorAlert
          message={errorAlertMessage}
          open={showErrorModel}
          onClose={() => {
            this.setState({
              showErrorModel: false,
              alertMessage: ''
            });
          }}
        />
      </div>
      </React.Fragment>
    );

  }
  
};

UploadModel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleUploadFile: PropTypes.func.isRequired,
  loading: false,
  classes: PropTypes.object.isRequired,
};

const uploadFileReducer = 'uploadFileReducer';


const mapStateToProps = state => ({
  uploadingFile: state.get(uploadFileReducer) && state.get(uploadFileReducer).loading ? state.get(uploadFileReducer).loading : false,
  fileUploaded: state.get(uploadFileReducer) && state.get(uploadFileReducer).fileUploaded ? state.get(uploadFileReducer).fileUploaded : '',
  message: state.get(uploadFileReducer) && state.get(uploadFileReducer).message ? state.get(uploadFileReducer).message : '',
  filePath: state.get(uploadFileReducer) && state.get(uploadFileReducer).filePath ? state.get(uploadFileReducer).filePath : '',
  fileUploadErrorMessage: state.get(uploadFileReducer) && state.get(uploadFileReducer).fileUploadErrorMessage ? state.get(uploadFileReducer).fileUploadErrorMessage : '',
});

const mapDispatchToProps = dispatch => ({
  handleUploadFile: bindActionCreators(uploadFile, dispatch),
  handleUploadFileClear: bindActionCreators(uploadFileClear, dispatch),
});

const UploadMapped = connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadModel);


export default withStyles(styles)(UploadMapped);
