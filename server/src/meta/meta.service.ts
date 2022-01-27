import {
  EntitySchemaColumnOptions,
  EntitySchemaRelationOptions,
} from 'typeorm';
import { EntitySchemaOptions } from 'typeorm/entity-schema/EntitySchemaOptions';
import { convertDefault } from './convert-default';
import { convertType } from './convert-type';
import { EntityMeta, EntityType } from './meta-interface/entity-meta';
import { PackageMeta } from './meta-interface/package-meta';
import { CombinationType, RelationMeta } from './meta-interface/relation-meta';
import { RelationType } from './meta-interface/relation-type';
import { SCHEMAS_DIR } from '../util/consts';
import { importJsonsFromDirectories } from '../util/DirectoryExportedDirectivesLoader';

interface WithUuid {
  uuid: string;
}

export class MetaService {
  private _entityMetas: (EntitySchemaOptions<any> & WithUuid)[] = [];
  private _packages: PackageMeta[];

  constructor() {
    this.loadPublishedMetas();
  }

  public reload() {
    this.loadPublishedMetas();
  }

  public get entitySchemas() {
    return this._entityMetas;
  }

  public getPackageMetas() {
    return this._packages;
  }

  public findEntityMetaOrFailed(name: string) {
    const schema = this.getMeta(name);
    if (!schema) {
      throw new Error(`Can not find entity "${name}"`);
    }
    return schema;
  }

  public findRelationEntityMeta(entity: string, relationName: string) {
    const entitySchema = this.getMeta(entity);
    if (!entitySchema) {
      throw new Error(`Can not find entity "${entity}"`);
    }
    if (entitySchema.relations) {
      return entitySchema.relations[relationName];
    }
    return;
  }

  public getMeta(name: string) {
    return this._entityMetas.find((schema) => schema.name === name);
  }

  public getEntityMetaOrFailed(name: string) {
    for (const aPackage of this._packages) {
      const entityMeta = aPackage.entities?.find(
        (entity) => entity.name === name,
      );
      if (entityMeta) {
        return entityMeta;
      }
    }
    throw new Error(`Can not find entity meta ${name}`);
  }

  public getEntityMetaOrFailedByUuid(entityUuid: string) {
    for (const aPackage of this._packages) {
      const entityMeta = aPackage.entities?.find(
        (entity) => entity.uuid === entityUuid,
      );
      if (entityMeta) {
        return entityMeta;
      }
    }
    throw new Error(`Can not find entity meta ${entityUuid}`);
  }

  public getRelationMetaNameOrFailed(relationName: string, entityName: string) {
    const entitySchema = this.getMeta(entityName);
    if (!entitySchema) {
      throw new Error(`Entity ${entityName} dose not exist`);
    }
    const relations = entitySchema.relations;
    if (!relations) {
      return undefined;
    }

    if (relations[relationName]) {
      return relations[relationName].target?.toString();
    }
  }

  public getRelationEntityMetaOrFailed(
    relationName: string,
    entityName: string,
  ) {
    return this.getEntityMetaOrFailed(
      this.getRelationMetaNameOrFailed(relationName, entityName),
    );
  }

  public getEntityCombinationRelationMetas(enityUuid: string) {
    const relations: RelationMeta[] = [];
    for (const aPackage of this._packages) {
      for (const relation of aPackage.relations) {
        if (
          (relation.sourceId === enityUuid &&
            relation.combination === CombinationType.ON_SOURCE) ||
          (relation.targetId === enityUuid &&
            relation.combination === CombinationType.ON_TARGET)
        ) {
          relations.push(relation);
        }
      }
    }

    return relations;
  }

  public isCombinationRole(entityUuid: string, roleName: string) {
    const combinationRelations =
      this.getEntityCombinationRelationMetas(entityUuid);
    for (const relation of combinationRelations) {
      if (
        relation.sourceId === entityUuid &&
        relation.roleOnSource === roleName
      ) {
        return true;
      }
      if (
        relation.targetId === entityUuid &&
        relation.roleOnTarget === roleName
      ) {
        return true;
      }
    }
    return false;
  }

  private loadPublishedMetas() {
    this._entityMetas = [];
    const entityMetas: EntityMeta[] = [];
    const abstractEntityMetas: EntityMeta[] = [];
    const relationMetas: RelationMeta[] = [];
    const packages: PackageMeta[] = importJsonsFromDirectories([
      SCHEMAS_DIR + '*.json',
    ]);

    this._packages = packages;

    packages.forEach((aPackage) => {
      entityMetas.push(
        ...(aPackage.entities.filter(
          (entity) =>
            entity.entityType !== EntityType.ENUM &&
            entity.entityType !== EntityType.INTERFACE,
        ) || []),
      );
      abstractEntityMetas.push(
        ...(aPackage.entities.filter(
          (entity) => entity.entityType === EntityType.ABSTRACT,
        ) || []),
      );
      relationMetas.push(...(aPackage.relations || []));
    });

    entityMetas.forEach((entityMeta) => {
      const columns: {
        [key: string]: EntitySchemaColumnOptions & WithUuid;
      } = {};
      const relations: {
        [key: string]: EntitySchemaRelationOptions & WithUuid;
      } = {};
      for (const column of entityMeta.columns) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, type, ...rest } = column;
        columns[column.name] = {
          ...rest,
          type: convertType(column.type),
          default: convertDefault(column),
        };
      }

      // 处理关系，忽略继承关系
      for (const relation of relationMetas.filter(
        (rela) => rela.relationType !== RelationType.INHERIT,
      )) {
        if (relation.sourceId === entityMeta.uuid) {
          relations[relation.roleOnSource] = {
            uuid: relation.uuid,
            target: entityMetas.find(
              (entity) => entity.uuid === relation.targetId,
            )?.name,
            type: relation.relationType as any, // 加any照顾继承
            inverseSide: relation.roleOnTarget,
            joinTable:
              relation.relationType === RelationType.MANY_TO_MANY &&
              relation.ownerId === entityMeta.uuid
                ? true
                : undefined,
            joinColumn:
              relation.relationType === RelationType.ONE_TO_ONE &&
              relation.ownerId === entityMeta.uuid
                ? true
                : undefined,
          };
        }
        if (relation.targetId === entityMeta.uuid) {
          let relationType = relation.relationType;
          if (relation.relationType === RelationType.ONE_TO_MANY) {
            relationType = RelationType.MANY_TO_ONE;
          }
          if (relation.relationType === RelationType.MANY_TO_ONE) {
            relationType = RelationType.ONE_TO_MANY;
          }
          relations[relation.roleOnTarget] = {
            uuid: relation.uuid,
            target: entityMetas.find(
              (entity) => entity.uuid === relation.sourceId,
            )?.name,
            type: relationType as any, // 加any照顾继承
            inverseSide: relation.roleOnSource,
            joinTable:
              relationType === RelationType.MANY_TO_MANY &&
              relation.ownerId === entityMeta.uuid
                ? true
                : undefined,
            joinColumn:
              relationType === RelationType.ONE_TO_ONE &&
              relation.ownerId === entityMeta.uuid
                ? true
                : undefined,
          };
        }
      }

      const entitySchemaOption: EntitySchemaOptions<any> & WithUuid = {
        uuid: entityMeta.uuid,
        name: entityMeta.name,
        columns,
        relations,
        indices: entityMeta.columns
          ?.filter((column) => column.index)
          .map((column) => {
            return {
              columns: [column.name],
            };
          }),
      };

      this._entityMetas.push(entitySchemaOption);
    });

    // 处理继承关系, 包含的父类部分引用，而不是副本，需要注意数据污染
    for (const relation of relationMetas.filter(
      (rela) => rela.relationType === RelationType.INHERIT,
    )) {
      const parent = this._entityMetas.find(
        (entity) => entity.uuid === relation.targetId,
      );
      const child = this._entityMetas.find(
        (entity) => entity.uuid === relation.sourceId,
      );
      if (parent && child) {
        child.columns = { ...parent.columns, ...child.columns };
        child.relations = { ...parent.relations, ...child.relations };
      }
    }

    // 删除 Abstract class
    this._entityMetas = this.entitySchemas.filter((entitySchema) => {
      return !abstractEntityMetas.find(
        (meta) => entitySchema.uuid === meta.uuid,
      );
    });
  }
}
