import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { MetaService } from './meta/meta.service';
import { SchemaService } from './schema/schema.service';
import { TypeOrmService } from './typeorm/typeorm.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

// Construct a schema, using GraphQL schema language
// const schema = buildSchema(`
//   type Query {
//     hello: String
//   }
// `);

// The root provides a resolver function for each API endpoint
const root = {
  hello2: () => {
    return 'Hello world!';
  },
};

const metaService = new MetaService();
const schema = new SchemaService(metaService).getSchema();
const typeOrmServce = new TypeOrmService(metaService);

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  }),
);
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');

/*
  app.use(
  '/graphql',
  graphqlHTTP(async (request, response, graphQLParams) => ({
    schema: MyGraphQLSchema,
    rootValue: await someFunctionToGetRootValue(request),
    graphiql: true,
  })),
);
 */
