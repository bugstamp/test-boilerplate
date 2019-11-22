import jwt from 'jsonwebtoken';

import config from '../config';
import storage, { checkToken } from './index';

const { tokenSecrets } = config;

describe('test storage', () => {
  it('test set/get methods', () => {
    expect(storage.token.set('token')).toEqual(true);
    expect(storage.refreshToken.set('refreshToken')).toEqual(true);
    expect(storage.token.get()).toEqual('token');
    expect(storage.refreshToken.get()).toEqual('refreshToken');
  });

  it('test remove methods', () => {
    expect(storage.token.remove()).toEqual(true);
    expect(storage.refreshToken.remove()).toEqual(true);
    expect(storage.token.get()).toEqual('');
    expect(storage.refreshToken.get()).toEqual('');
  });

  it('test storage methods', () => {
    expect(storage.setTokens('token', 'refreshToken')).toEqual(true);
    expect(storage.getTokens()).toMatchObject({
      token: 'token',
      refreshToken: 'refreshToken',
    });
    expect(storage.removeTokens('token', 'refreshToken')).toEqual(true);
    expect(storage.getTokens()).toMatchObject({
      token: '',
      refreshToken: '',
    });
  });
});

describe('test checkToken', () => {
  const mockToken = {
    data: {
      regStatus: 'COMPLETED',
    },
  };

  it('if token doesn\'t exist', () => {
    expect(checkToken()).toMatchObject({ regStatus: '' });
  });

  it('verify token', () => {
    const token = jwt.sign(mockToken, tokenSecrets.token);

    expect(checkToken(token)).toMatchObject({ regStatus: 'COMPLETED' });
  });
});
