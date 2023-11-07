import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Chip from '@material-ui/core/Chip';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { injectIntl, intlShape } from 'react-intl';
import Icon from '@material-ui/core/Icon';
import messages from 'enl-api/ui/menuMessages';
import styles from './sidebar-jss';
import { userProfile } from '../../containers/Login/authActions';

const LinkBtn = React.forwardRef(function LinkBtn(props, ref) { // eslint-disable-line
  return <NavLink to={props.to} {...props} innerRef={ref} />; // eslint-disable-line
});

class MainMenu extends React.Component { // eslint-disable-line
  constructor(props) {
    super(props);
    this.state = {
      userUpdate: false
    };
  }

  static getDerivedStateFromProps(nextProps, preState) {
    const {
      handleUserProfile,
      profileData
    } = nextProps;
    const { userUpdate } = preState;
    const updateState = {};
    if (!profileData) {
      handleUserProfile();
    } else {
      updateState.profileData = profileData;
    }
    return updateState;
  }


  handleClick() {
    const { toggleDrawerOpen, loadTransition } = this.props;
    toggleDrawerOpen();
    loadTransition(false);
  }

  render() {
    const {
      classes,
      openSubMenu,
      open,
      dataMenu,
      intl,
      profileData
    } = this.props;
    const getMenus = menuArray => menuArray.map((item, index) => {
      if(item.key === "create_user" && profileData && profileData.role === "VIEWER") {
        return ;
      } else if (item.key === 'audit_logs' && profileData && profileData.role === 'VIEWER') {
        return;
      } else {
        if (item.child) {
          return (
            <div key={index.toString()}>
              <ListItem
                button
                style={{ paddingLeft: item.isNestedChild ? 40 : 10 }}
                className={
                  classNames(
                    classes.head,
                    item.icon ? classes.iconed : '',
                    open.indexOf(item.key) > -1 ? classes.opened : '',
                  )
                }
                onClick={() => openSubMenu(item.key, item.keyParent)}
              >
                {item.icon && (
                  <ListItemIcon className={classes.icon}>
                    <Icon>{item.icon}</Icon>
                  </ListItemIcon>
                )}
                <ListItemText
                  classes={{ primary: classes.primary }}
                  variant="inset"
                  primary={
                    messages[item.key] !== undefined
                      ? intl.formatMessage(messages[item.key])
                      : item.name
                  }
                />
                { open.indexOf(item.key) > -1 ? <ExpandLess /> : <ExpandMore /> }
              </ListItem>
              <Collapse
                component="div"
                className={classNames(
                  classes.nolist,
                  (item.keyParent ? classes.child : ''),
                )}
                in={open.indexOf(item.key) > -1}
                timeout="auto"
                unmountOnExit
              >
                <List className={classes.dense} component="nav" dense>
                  { getMenus(item.child, 'key') }
                </List>
              </Collapse>
            </div>
          );
        }
      }
      if (item.title) {
        return (
          <ListItem
            key={index.toString()}
            className={classes.nested}
            style={{ paddingLeft: 40 }}
          >
            {item.icon && (
              <ListItemIcon className={classes.icon}>
                <Icon>{item.icon}</Icon>
              </ListItemIcon>
            )}
            <ListItemText
              classes={{ primary: classes.subHeader }}
              primary={
                messages[item.key] !== undefined
                  ? intl.formatMessage(messages[item.key])
                  : item.name
              }
            />
          </ListItem>
        );
      }
      return (
        <ListItem
          key={index.toString()}
          button
          exact
          className={classes.nested}
          activeClassName={classes.active}
          component={LinkBtn}
          to={item.link}
          onClick={() => this.handleClick()}
          style={item.name === 'Dashboard' ? { paddingLeft: 0 } : {}}
        >
          {item.icon && (
            <ListItemIcon style={{ paddingLeft: 0 }} className={classes.icon}>
              <Icon>{item.icon}</Icon>
            </ListItemIcon>
          )}
          <ListItemText
            classes={{ primary: classes.primary }}
            variant="inset"
            primary={
              messages[item.key] !== undefined
                ? intl.formatMessage(messages[item.key])
                : item.name
            }
          />
          {item.badge && (
            <Chip color="primary" label={item.badge} className={classes.badge} />
          )}
        </ListItem>
      );
    });
    return (
      <div>
        {getMenus(dataMenu)}
      </div>
    );
  }
}

MainMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.object.isRequired,
  openSubMenu: PropTypes.func.isRequired,
  toggleDrawerOpen: PropTypes.func.isRequired,
  loadTransition: PropTypes.func.isRequired,
  dataMenu: PropTypes.array.isRequired,
  intl: intlShape.isRequired,
};

const openAction = (key, keyParent) => ({ type: 'OPEN_SUBMENU', key, keyParent });
const reducer = 'ui';

const adminAuthReducer = 'adminAuthReducer';

const mapStateToProps = state => ({
  force: state, // force active class for sidebar menu
  open: state.getIn([reducer, 'subMenuOpen']),
  profileData: state.get(adminAuthReducer) && state.get(adminAuthReducer).profileData ? state.get(adminAuthReducer).profileData : null
});

const mapDispatchToProps = dispatch => ({
  openSubMenu: bindActionCreators(openAction, dispatch),
  handleUserProfile: bindActionCreators(userProfile, dispatch)
});

const MainMenuMapped = connect(
  mapStateToProps,
  mapDispatchToProps
)(MainMenu);

export default withStyles(styles)(injectIntl(MainMenuMapped));
