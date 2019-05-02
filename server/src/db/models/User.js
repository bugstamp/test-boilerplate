import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pick, upperFirst } from 'lodash';
import EmailValidator from 'email-validator';

import mongoose from '../mongoose';
import {
  AuthenticationError,
  BadInputError,
} from '../../utils/apolloErrors';
import {
  EMAIL_UNCONFIRMED,
  UNCOMPLETED,
  COMPLETED,
  ONLINE,
  OFFLINE,
} from './enums';

const { ObjectId } = mongoose.Schema.Types;

const tokensConfig = {
  token: {
    secret: process.env.TOKEN_SECRET,
    expiresIn: 10,
    model: ['id', 'regStatus'],
  },
  refresh: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: 20,
    model: ['id', 'regStatus'],
  },
  register: {
    secret: process.env.REGISTER_TOKEN_SECRET,
    expiresIn: '1d',
    model: ['id'],
  },
};

const userSocialsSchema = new mongoose.Schema({
  google: String,
  facebook: String,
  github: String,
});

const userContactSettingsSchema = new mongoose.Schema({
  notifications: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const userContactSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    require: true,
  },
  chatId: {
    type: ObjectId,
    require: true,
  },
  settings: userContactSettingsSchema,
});

const userSchema = new mongoose.Schema({
  // avatar: {},
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    require: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  displayName: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
  },
  status: {
    type: String,
    enum: [OFFLINE, ONLINE],
    default: OFFLINE,
  },
  createDate: {
    type: Date,
    require: true,
    default: new Date(),
  },
  lastDate: {
    type: Date,
    require: true,
    default: new Date(),
  },
  refreshToken: {
    type: String,
  },
  regStatus: {
    type: String,
    enum: [EMAIL_UNCONFIRMED, UNCOMPLETED, COMPLETED],
    require: true,
    default: EMAIL_UNCONFIRMED,
  },
  socials: userSocialsSchema,
  contacts: [userContactSchema],
});

userSchema.pre('save', async function preSave(next) {
  if (this.isNew) {
    await this.updateOne({ createDate: new Date() });
  }
  if (!this.isModified('password')) {
    next();
  }

  try {
    await this.genHash();

    next();
  } catch (e) {
    next(e);
  }
});

userSchema.methods = {
  async genHash() {
    try {
      const salt = await bcrypt.genSalt(Math.random());
      const hash = await bcrypt.hash(this.password, salt);

      this.password = hash;
    } catch (e) {
      throw e;
    }
  },
  async comparePassword(password) {
    try {
      const result = await bcrypt.compare(password, this.password);

      return result;
    } catch (e) {
      throw e;
    }
  },
  async genToken(type) {
    try {
      const { secret, expiresIn, model } = tokensConfig[type];
      const token = await jwt.sign({
        type: 'token',
        data: pick(this, model),
      }, secret, { expiresIn });

      return token;
    } catch (e) {
      throw e;
    }
  },
  async genTokens() {
    try {
      const token = await this.genToken('token');
      const refreshToken = await this.genToken('refresh');
      await this.updateOne({ refreshToken });

      return {
        token,
        refreshToken,
      };
    } catch (e) {
      throw e;
    }
  },
  async logActivity(phase = 'login') {
    try {
      await this.updateOne({
        status: phase === 'logout' ? OFFLINE : ONLINE,
        lastDate: new Date(),
      });
    } catch (e) {
      throw e;
    }
  },
};

userSchema.statics = {
  async getUserByField(field, value) {
    try {
      const user = await this.findOne({ [field]: value });

      return user;
    } catch (e) {
      throw e;
    }
  },
  async getUserBySocial({ id, name }, { email }) {
    try {
      let user;

      if (email) {
        user = await this.getUserByField('email', email);
      } else {
        user = await this.getUserByField(`socials.${name}`, id);
      }

      return user;
    } catch (e) {
      throw e;
    }
  },
  async verifyToken(token, type) {
    try {
      const { secret } = tokensConfig[type];
      const result = await jwt.verify(token, secret);

      return result;
    } catch (e) {
      throw new AuthenticationError({ message: `${upperFirst(type)} token is invalid` });
    }
  },
  async verifyTokens(token, refreshToken) {
    try {
      const { data } = await this.verifyToken(token, 'token');
      const user = await this.findById(data.id);

      if (!user) {
        throw new AuthenticationError({ message: 'User is not found' });
      }

      return {
        user: data,
      };
    } catch (e) {
      const { data } = await this.verifyToken(refreshToken, 'refresh');
      const user = await this.findById(data.id);
      const newTokens = await user.genTokens();

      return {
        user: data,
        newTokens,
      };
    }
  },
  async verifyInputData(field, value) {
    try {
      const user = await this.getUserByField(field, value);

      if (user) {
        throw new BadInputError({
          message: `The provided ${field} is already exist.`,
          data: { invalidField: field },
        });
      }
      return !user;
    } catch (e) {
      throw e;
    }
  },
  async verifyEmail(regToken) {
    try {
      const { data: { id } } = await this.verifyToken(regToken, 'register');

      const user = await this.findByIdAndUpdate(id, { regStatus: UNCOMPLETED });
      const tokens = await user.genTokens(user);

      return tokens;
    } catch (e) {
      throw e;
    }
  },
  async signInValidation(username, password) {
    try {
      const login = EmailValidator.validate(username) ? 'email' : 'username';
      const user = await this.getUserByField(login, username);

      if (!user) {
        throw new BadInputError({
          message: 'The provided username can\'t be found',
          data: { invalidField: 'username' },
        });
      }
      const { password: hash, regStatus } = user;
      const validPassword = await user.comparePassword(password, hash);
      const validRegistration = regStatus !== EMAIL_UNCONFIRMED;

      if (!validPassword) {
        throw new BadInputError({
          message: 'The provided password is incorrect',
          data: { invalidField: 'password' },
        });
      }
      if (!validRegistration) {
        throw new AuthenticationError({
          message: 'Your registration isn\'t completed.You need to confirm your email',
        });
      }

      return user;
    } catch (e) {
      throw e;
    }
  },
  async signInBySocialValidation(social, profile) {
    try {
      const user = await this.getUserBySocial(social, profile);

      if (!user) {
        throw new AuthenticationError({ message: 'User not found' });
      }
      return user;
    } catch (e) {
      throw e;
    }
  },
  async signUpBySocialValidation(social, profile) {
    try {
      const user = await this.getUserBySocial(social, profile);

      if (user) {
        throw new AuthenticationError({ message: 'User is exist' });
      }
      return user;
    } catch (e) {
      throw e;
    }
  },
};

const User = mongoose.model('User', userSchema);

export default User;
