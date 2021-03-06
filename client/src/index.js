import React from 'react';
import { render } from 'react-dom';
import registerSW from './registerSW';

import App from './components/App';

import apollo from './apollo';
import history from './router/history';
import { theme } from './styles';
import polyfill from './polyfill';

const renderApp = (Component) => {
  render((
    <Component
      client={apollo}
      history={history}
      theme={theme}
    />
  ), document.getElementById('root'));
};

polyfill();
renderApp(App);
registerSW();
