import { buildSchema, GraphQLSchema } from 'graphql';
import { EntityType } from '../meta/meta-interface/entity-meta';
import { MetaService } from '../meta/meta.service';
import _ = require('lodash');
import { columnTypeToGraphqlScalar } from './columnTypeToGraphqlScalar';

export class SchemaService {
  constructor(protected metaService: MetaService) {}

  public getSchema(): GraphQLSchema {
    let queryString = '';
    let typeString = `
      scalar Date
      scalar JSON
    `;
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
              .map(
                (column) =>
                  column.name + ':' + columnTypeToGraphqlScalar(column.type),
              )
              .join(',')}
            ${this.metaService
              .getEntityRelationMetas(entityMeta.uuid)
              .map((relation) => {
                const targetUuid =
                  entityMeta.uuid === relation.sourceId
                    ? relation.targetId
                    : relation.sourceId;
                const roleName =
                  entityMeta.uuid === relation.sourceId
                    ? relation.roleOnSource
                    : relation.roleOnTarget;
                return roleName
                  ? roleName +
                      ':' +
                      this.metaService.getEntityMetaOrFailedByUuid(targetUuid)
                        .name || ''
                  : '';
              })}
          }
        `;
        }
      }
    }

    //console.debug(typeString);
    return buildSchema(`
      ${typeString}
      type Query {
        hello2: String
        ${queryString}
      }

      type Mutation {
        login(name:String!, password:String!):String
      }
    `);
  }
}
