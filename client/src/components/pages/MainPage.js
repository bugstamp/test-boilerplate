import React, {
  cloneElement,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

import Navigation from '../common/Navigation/Navigation';
import SettingsDialog from './SettingsDialog';
import { AppContainer, MainPageWrapper } from './styled';

const MainPage = (props) => {
  const {
    children,
    loading,
    userId,
    signOut,
    sessionExpired,
  } = props;
  const [settingsDialog, toggleSettingsDialog] = useState(false);
  const handleToggleSettingDialog = () => {
    toggleSettingsDialog(!settingsDialog);
  };
  const handleSignOut = () => {
    signOut({ variables: { userId } });
  };
  useEffect(() => {
    if (sessionExpired) {
      handleSignOut();
    }
  }, [sessionExpired]);
  const childrenCloneProps = {
    initialLoading: loading,
    toggleSettingsDialog: handleToggleSettingDialog,
    signOut: handleSignOut,
  };
  const childrenClone = children
    ? cloneElement(children, childrenCloneProps)
    : null;

  return (
    <AppContainer container spacing={0} justify="center">
      <MainPageWrapper>
        <Grid container spacing={0}>
          <Hidden smDown>
            <Grid item>
              <Navigation
                toggleSettingsDialog={handleToggleSettingDialog}
                signOut={handleSignOut}
              />
            </Grid>
          </Hidden>
          <Grid item xs>
            {childrenClone}
          </Grid>
        </Grid>
      </MainPageWrapper>
      <SettingsDialog open={settingsDialog} toggle={handleToggleSettingDialog} />
    </AppContainer>
  );
};

MainPage.defaultProps = {
  children: null,
  userId: null,
};
MainPage.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  userId: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  sessionExpired: PropTypes.bool.isRequired,
  signOut: PropTypes.func.isRequired,
};

export default MainPage;
