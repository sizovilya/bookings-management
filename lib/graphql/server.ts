import {
  buildSchema,
} from 'graphql';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import Services from '../../services/services';

class GraphQLServer {
  private services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  public async run() {
    const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

    // The root provides a resolver function for each API endpoint
    const root = {
      hello: () => 'Hello world!',
    };

    const app = express();
    app.use('/graphql', graphqlHTTP({
      schema,
      rootValue: root,
      graphiql: true,
    }));
    app.listen(4000);
    console.log('Running a GraphQL API server at http://localhost:4000/graphql');
  }
}

export default GraphQLServer;
