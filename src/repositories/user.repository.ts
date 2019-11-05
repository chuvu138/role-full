import { DefaultCrudRepository, BelongsToAccessor, repository, juggler } from '@loopback/repository';
import { User, UserRelations, Role } from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { RoleRepository } from './role.repository';
export type UserCredentials = {
  email: string;
  password: string;
};
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
  > {

  public readonly role: BelongsToAccessor<
    Role,
    typeof User.prototype.id
  >;
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>
  ) {
    super(User, dataSource);
    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter)

    this.registerInclusionResolver('role', this.role.inclusionResolver);
  }
}
