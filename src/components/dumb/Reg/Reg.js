import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import queryString from 'query-string';
import styled from 'styled-components';
import { backgrounds } from 'polished';

import RegContainer from '../../smart/RegContainer';
import RegForm from './RegForm';
import withNotification from '../../common/HOC/withNotification';

import { checkToken } from '../../../router/PrivateRoute';
import bgImage from '../../../assets/images/reg-bg.jpg';

const Wrapper = styled(Grid)`
  flex: 1 auto;
  ${backgrounds(`url(${bgImage})`, 'center no-repeat')}
  background-size: cover;
`;

class SignUp extends Component {
  state = {
    activeStep: 0,
    completed: false,
  }

  steps = [
    'Create your account',
    'Tell us about yourself',
  ];

  async componentDidMount() {
    const { location: { search }, history } = this.props;
    const { token } = queryString.parse(search);

    if (token) {
      try {
        await checkToken(token, true);
        this.setActiveStep(1);
      } catch (e) {
        history.push('/reg');
      }
    }
  }

  handleSuccess = ({ token, refreshToken }) => {
    if (token && refreshToken) {
      const { history } = this.props;

      localStorage.setItem('chatkilla_tkn', token);
      localStorage.setItem('chatkilla_rfrsh_tkn', refreshToken);
      history.push('/');
    } else {
      this.setState({ completed: true });
    }
  }

  handleError = (e) => {
    if (e.graphQLErrors) {
      const { toggleNotification } = this.props;
      const { graphQLErrors } = e;
      const { message } = graphQLErrors[0];

      toggleNotification(message);
    }
  }

  setActiveStep = (step) => {
    this.setState(() => ({ activeStep: step }));
  }

  render() {
    const { activeStep, completed } = this.state;

    return (
      <RegContainer
        signUpProps={{
          onCompleted: ({ signUp }) => this.handleSuccess(signUp),
        }}
        signUpCompletionProps={{
          onCompleted: ({ signUpCompletion }) => this.handleSuccess(signUpCompletion),
        }}
        signUpBySocialProps={{
          onCompleted: ({ signUpBySocial }) => this.handleSuccess(signUpBySocial),
          onError: this.handleError,
        }}
      >
        {({
          signUpAsyncValidationUsername,
          signUpAsyncValidationEmail,
          signUp,
          signUpCompletion,
          signUpBySocial,
        }) => (
          <Wrapper
            ref={this.createRef}
            justify="center"
            alignItems="center"
            container
          >
            <RegForm
              steps={this.steps}
              activeStep={activeStep}
              completed={completed}
              signUpAsyncValidationUsername={signUpAsyncValidationUsername}
              signUpAsyncValidationEmail={signUpAsyncValidationEmail}
              signUp={signUp}
              signUpCompletion={signUpCompletion}
              signUpBySocial={signUpBySocial}
            />
          </Wrapper>
        )}
      </RegContainer>
    );
  }
}

export default withNotification(SignUp);
