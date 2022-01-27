import { buildSchema, GraphQLSchema } from 'graphql';
import { MetaService } from '../meta/meta.service';

export class SchemaService {
  constructor(protected metaService: MetaService) {}

  public getSchema(): GraphQLSchema {
    let queryString = '';

    for (const meta of this.metaService.entityMetas) {
      queryString =
        queryString +
        `
        ${meta.name}: String
        
      `;
    }
    return buildSchema(`
      type Query {
        hello2: String
        ${queryString}
      }
    `);
  }
}
