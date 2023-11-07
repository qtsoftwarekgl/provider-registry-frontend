import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import defaultUserImg from 'enl-images/user-default.jpg';
import Chip from '@material-ui/core/Chip';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {
  getNationality
} from '../../../utils/helpers';
import * as URL from '../../../lib/apiUrls';
import moment from 'moment';

const useStyles = makeStyles(() => ({
  root: {
    '& .MuiDialog-paperWidthSm': {
      maxWidth: 900,
      minWidth: 900
    }
  },
  titleRoot: {
    marginBottom: 10
  },
  label: {
    fontWeight: 'bold'
  },
  value: {
    marginLeft: 10
  },
  label_head: {
    fontWeight: 'bold',
    fontSize: '1.125rem',
    borderBottom: '1px dashed #C0C0C0'
  },
  activeChip: {
    minWidth: 90,
    backgroundColor: '#2e8e0f'
  },
  inactiveChip: {
    minWidth: 90,
    backgroundColor: '#8c8989'
  },
  deletedChip: {
    minWidth: 90,
    backgroundColor: '#b92b2b'
  },
  table: {
    minWidth: 500,
    marginTop: 15
  }
}));

const StyledTableCell = withStyles((theme) => ({
  head: {
    color: theme.palette.common.black,
    padding: 8
  },
  body: {
    fontSize: 14,
    padding: 8
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);


const ViewModal = (props) => {
  const classes = useStyles();
  const {
    open, onClose, data
  } = props;
  const rows = data && data.facilities ? data.facilities : [];
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        className={classes.root}
      >
        <DialogTitle id="scroll-dialog-title" className={classes.titleRoot}>
        Provider Info
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={3} spacing={1} style={{ marginTop: '3rem' }}>
              <div style={{
                height: 170,
                marginLeft: 20,
                marginTop: 0,
                marginRight: 50,
                border: '1px dashed black'
              }}
              >
                <img
                  style={{ width: '100%', height: '100%' }}
                  src={`${URL.ASSET_URL}${data && data.photo}`}
                  alt=""
                  onError={(e) => { e.target.src = defaultUserImg; }}
                />
              </div>
            </Grid>
            <Grid container item xs={12} sm={9} spacing={1}>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={12}>
                  <h6 className={classes.label_head}>
                    Users Details
                  </h6>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Type of Document:</span>
                  <span className={classes.value}>
                    {data && data.documentType}
                  </span>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Email:</span>
                  <span className={classes.value}>{data && data.email}</span>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Document Number:</span>
                  <span className={classes.value}>
                    {data && data.documentNumber}
                  </span>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Nationality:</span>
                  <span className={classes.value}>{getNationality(data && data.nationality)}</span>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Surname:</span>
                  <span className={classes.value}>{data && data.surName}</span>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Telephone Number:</span>
                  <span className={classes.value}>{data && data.phoneNumber}</span>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Post-Names:</span>
                  <span className={classes.value}>{data && data.postNames}</span>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>License Number:</span>
                  <span className={classes.value}>{data && data.licenseNumber}</span>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Date of Birth:</span>
                  <span className={classes.value}>{(data && data.documentType === 'FOREIGN_ID' ||  data && data.documentType === 'PASSPORT') ? (data && data.dateOfBirth?(moment(data.dateOfBirth).format('DD/MM/YYYY')) :'-') : data.dateOfBirth}</span>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Qualification:</span>
                  <span className={classes.value}>{data && data.qualification}</span>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Sex:</span>
                  <span className={classes.value}>{data && data.sex}</span>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Marital Status:</span>
                  <span className={classes.value}>{data && data.maritalStatus}</span>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
              <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Registration Date:</span>
                  <span className={classes.value}>{data && data.createdAt?(moment(data.createdAt).format('DD/MM/YYYY')) :'-'}</span>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>License Number Expiry Date:</span>
                  <span className={classes.value}>{data && data.licenseExpiryDate?(moment(data.licenseExpiryDate).format('DD/MM/YYYY')) :'-'}</span>
                </Grid>
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Status</span>
                  <span className={classes.value}>
                    {
                      data && data.status === 'ACTIVE'
                        ? (<Chip label="Active" color="primary" size="small" icon={<CheckIcon />} className={classes.activeChip} />)
                        : data && data.status === 'INACTIVE' ? (<Chip label="Inactive" color="primary" size="small" icon={<ClearIcon />} className={classes.inactiveChip} />) : ''
                    }
                  </span>
                </Grid>
                {data && data.deactivateReason ? (
                <Grid item xs={12} sm={6}>
                  <span className={classes.label}>Reason for status change:</span>
                  <span className={classes.value}>{data && data.deactivateReason ? data.deactivateReason : ''}</span>
                </Grid>
                ): null}      
              </Grid>
              <Grid container item xs={12} sm={12}>
                <Table className={classes.table} aria-label="customized table" component={Paper}>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell colSpan={3} align="center">Job Attributes</StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>Name</StyledTableCell>
                      <StyledTableCell>Code</StyledTableCell>
                      <StyledTableCell align="center">Location Code</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <StyledTableRow key={row.name}>
                        <StyledTableCell component="th" scope="row">
                          {row.name}
                        </StyledTableCell>
                        <StyledTableCell>{row.code}</StyledTableCell>
                        <StyledTableCell align="center">{row.locationCode}</StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

ViewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default ViewModal;
