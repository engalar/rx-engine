import { buildSchema, GraphQLSchema } from 'graphql';
import { MetaService } from '../meta/meta.service';

export class SchemaService {
  constructor(protected metaService: MetaService) {}

  public getSchema(): GraphQLSchema {
    return buildSchema(`
      type Query {
        hello: String
      }
    `);
  }
}
