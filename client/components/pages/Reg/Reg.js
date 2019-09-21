import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import queryString from 'query-string';
import styled, { keyframes } from 'styled-components';
import { backgrounds } from 'polished';
import { fadeIn } from 'react-animations';

import RegContainer from '../../containers/RegContainer';
import RegForm from './RegForm';
import RegPresentation from './RegPresentation';

import withNotification from '../../common/HOC/withNotification';
import { checkToken } from '../../../router/PrivateRoute';
import storage from '../../../storage';

import { getStyledProps } from '../../../styles';
import bgImage from '../../../assets/images/reg-bg__1920_65.jpg';

const fadeInAnimation = keyframes`${fadeIn}`;

const Wrapper = styled(Grid)`
  && {
    flex: 1 auto;
    display: flex;
    flex-flow: row nowrap;
    position: relative;
    ${backgrounds(`url(${bgImage})`, 'no-repeat')}
    background-size: cover;
    background-position: center;
    overflow: hidden;

  ${(props) => {
    const breakpoints = getStyledProps('theme.breakpoints')(props);
    const smDown = breakpoints.down('sm');

    return `
      ${smDown} {
        flex-flow: column;
      }
    `;
  }}
  }
`;

const FormWrapper = styled.div`
  flex: 1 40%;
  max-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  animation: 1.5s ${fadeInAnimation};
  animation-delay: 1s;
  animation-fill-mode: forwards;

  ${(props) => {
    const breakpoints = getStyledProps('theme.breakpoints')(props);
    const smDown = breakpoints.down('sm');

    return `
      ${smDown} {
        animation-play-state: paused;
        opacity: 1;
      }
    `;
  }}
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
        const { regStatus } = await checkToken(token, true);

        if (regStatus) {
          this.setActiveStep(1);
        } else {
          history.push('/reg');
        }
      } catch (e) {
        throw e;
      }
    }
  }

  handleSuccess = ({ token, refreshToken }) => {
    if (token && refreshToken) {
      const { history } = this.props;

      storage.setTokens(token, refreshToken);
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
          <Wrapper container>
            <RegPresentation />
            <FormWrapper>
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
            </FormWrapper>
          </Wrapper>
        )}
      </RegContainer>
    );
  }
}

SignUp.propTypes = {
  location: PropTypes.objectOf(PropTypes.any).isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  toggleNotification: PropTypes.func.isRequired,
};

export default withNotification(SignUp);