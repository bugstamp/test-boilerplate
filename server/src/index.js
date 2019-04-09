import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { formatError } from 'apollo-errors';
import cors from 'cors';

import './dotenv';
import paths from '../../paths';

import db from './db';
import typeDefs from './schemas';
import resolvers from './resolvers';
import routers from './routers';
import middlewares from './middlewares';

const { verification } = routers;
const { tokenVerification } = middlewares;

const port = process.env.PORT;
const apolloPath = process.env.APOLLO_PATH;

const startServer = async () => {
  const app = express();
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    context: ({ req }) => {
      const { user } = req;

      return { db, user };
    },
  });
  const corsOptions = {};

  app.use(express.static(paths.public));
  app.use(cors(corsOptions));
  app.use(tokenVerification);
  app.use(verification);

  apolloServer.applyMiddleware({ app, path: apolloPath });

  app.get('*', (req, res) => {
    res.sendFile(paths.html);
  });

  app.listen({ port }, () => {
    console.log(`Server is listening on port - ${port}`);
  });
};

startServer();
