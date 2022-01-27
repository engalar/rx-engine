import { buildSchema, GraphQLSchema } from 'graphql';
import { EntityType } from '../meta/meta-interface/entity-meta';
import { MetaService } from '../meta/meta.service';
import _ = require('lodash');

export class SchemaService {
  constructor(protected metaService: MetaService) {}

  public getSchema(): GraphQLSchema {
    let queryString = '';
    let typeString = '';
    const packages = this.metaService.getPackageMetas();
    for (const packeMeta of packages) {
      for (const entityMeta of packeMeta.entities) {
        if (
          entityMeta.entityType !== EntityType.ENUM &&
          entityMeta.entityType !== EntityType.INTERFACE &&
          entityMeta.entityType !== EntityType.ABSTRACT
        ) {
          queryString =
            queryString +
            `
          ${_.lowerFirst(entityMeta.name)}: [${entityMeta.name}]
          ${_.lowerFirst(entityMeta.name)}ByPk: ${entityMeta.name}
          ${_.lowerFirst(entityMeta.name)}Aggregate: String
        `;

          typeString =
            typeString +
            `
          type ${entityMeta.name}{
            ${entityMeta.columns
              .map((column) => column.name + ':String')
              .join(',')}
          }
        `;
        }
      }
    }

    return buildSchema(`
      ${typeString}
      type Query {
        hello2: String
        ${queryString}
      }
    `);
  }
}
