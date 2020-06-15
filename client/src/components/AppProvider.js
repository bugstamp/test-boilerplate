import React from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider } from '@apollo/react-hooks';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';

import AppContextProvider from './context/AppProvider';

const AppProvider = ({ client, theme, children }) => (
  <ApolloProvider client={client}>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  </ApolloProvider>
);

AppProvider.propTypes = {
  client: PropTypes.objectOf(PropTypes.any).isRequired,
  theme: PropTypes.objectOf(PropTypes.any).isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]).isRequired,
};

export default AppProvider;