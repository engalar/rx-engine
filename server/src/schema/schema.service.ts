import { buildSchema, GraphQLSchema } from 'graphql';
import { EntityType } from '../meta/meta-interface/entity-meta';
import { MetaService } from '../meta/meta.service';

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
          ${entityMeta.name}: ${entityMeta.name}
          
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
