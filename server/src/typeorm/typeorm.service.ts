import {
  Connection,
  createConnection,
  EntitySchema,
  Repository,
} from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';
import { MetaService } from '../meta/meta.service';
import { DB_CONFIG_FILE } from '../util/consts';

const CONNECTION_WITH_SCHEMA_NAME = 'WithSchema';

export class TypeOrmService {
  // private readonly _logger = new Logger('TypeOrmWithSchemaService');
  private _connection?: Connection;
  // private _connectionNumber = 1;

  constructor(private readonly metaService: MetaService) {}

  async createConnection() {
    if (!PlatformTools.fileExist(DB_CONFIG_FILE)) {
      return;
      // throw new Error(NOT_INSTALL_ERROR);
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dbConfig = require(PlatformTools.pathResolve(DB_CONFIG_FILE));

    this._connection = await createConnection({
      ...dbConfig,
      entities: this.metaService.entityMetas.map(
        (meta) => new EntitySchema<any>(meta),
      ),
      name: CONNECTION_WITH_SCHEMA_NAME, // + this._connectionNumber,
      synchronize: true,
    });
  }

  public get connection() {
    return this._connection;
  }

  public getRepository<Entity>(name: string): Repository<Entity> {
    return this.connection.getRepository(name);
  }

  // 会关闭旧连接，并且以新名字创建一个新连接
  async restart() {
    await this.closeConection();
    // this._connectionNumber++;
    // 重新加载模式
    this.metaService.reload();
    await this.createConnection();

    console.debug('Restart success!');
  }

  async onModuleInit() {
    await this.createConnection();
    console.debug('TypeOrmWithSchemaService initializated');
  }

  async onApplicationShutdown() {
    await this.closeConection();
  }

  private async closeConection() {
    try {
      await this.connection?.close();
    } catch (e) {
      console.error(e?.message);
    }
  }
}
