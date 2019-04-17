import { GraphQLModule } from '@graphql-modules/core';
import { gql } from 'apollo-server-express';

import resolvers from './userResolvers';

import ScalarsModule from '../scalars';

const UserModule = new GraphQLModule({
  name: 'user',
  imports: [ScalarsModule],
  typeDefs: gql`
    enum Status {
      OFFLINE
      ONLINE
    }

    enum regStatus {
      EMAIL_UNCONFIRMED
      UNCOMPLETED
      COMPLETED
    }

    type Social {
      google: ID!
      facebook: ID!
      github: ID!
    }

    type Friend {
      userId: ID!
      chatId: ID!
    }

    type User {
      id: ID!
      username: String
      email: String!
      displayName: String
      firstName: String
      lastName: String
      gender: String
      birthday: DateTime
      status: Status
      createDate: DateTime!
      lastDate: DateTime!
      refreshToken: String
      regStatus: regStatus
      socials: Social
      friends: Friend
    }

    type Query {
      user(id: ID!): User
      users: [User]
    }

    type Mutation {
      delete: User
    }
  `,
  resolvers,
});

export default UserModule;