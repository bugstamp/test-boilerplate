import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import importedComponent from 'react-imported-component';

import Login from '../components/pages/Login/Login';
import Reg from '../components/pages/Reg/Reg';
import Chats from '../components/pages/Chats/Chats';
import NotFound from '../components/common/NotFound';
import PageLoader from '../components/common/PageLoader';

import AppRoute from './AppRoute';

const LoginLayout = importedComponent(() => import(/* webpackChunkName: "login" */'../components/layouts/LoginLayout'), {
  LoadingComponent: PageLoader,
});

const AppLayout = importedComponent(() => import(/* webpackChunkName: "chat" */'../components/layouts/AppLayout'), {
  LoadingComponent: PageLoader,
});

const NotFoundLayout = importedComponent(() => import(/* webpackChunkName: "unknown" */'../components/layouts/NotFoundLayout'), {
  LoadingComponent: PageLoader,
});

const Routes = () => (
  <Switch>
    <AppRoute path="/login" layout={LoginLayout} component={Login} />
    <AppRoute path="/reg" layout={LoginLayout} component={Reg} />
    <AppRoute exact path="/" component={Redirect} to="/chats" redirect />
    <AppRoute path="/chats" layout={AppLayout} component={Chats} privateRoute />
    <AppRoute path="*" layout={NotFoundLayout} component={NotFound} />
  </Switch>
);

export default Routes;
