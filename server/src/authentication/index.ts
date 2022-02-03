import { TypeOrmService } from '../typeorm/typeorm.service';

export class Authentication {
  constructor(protected typeormService: TypeOrmService) {}

  login(name: string, password: string) {}

  me(token: string) {}

  logout() {}
}
