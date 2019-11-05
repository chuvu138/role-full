import { DefaultCrudRepository, HasManyRepositoryFactory, juggler, repository } from '@loopback/repository';
import { Role, RoleRelations, User } from '../models';
import { MongoDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { UserRepository } from './user.repository';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
  > {
  public readonly users: HasManyRepositoryFactory<
    User,
    typeof Role.prototype.id
  >;
  /* public readonly permissons: HasManyRepositoryFactory<
    Permission,
    typeof Role.prototype.id
  >; */
  constructor(
    @inject('datasources.mongo') dataSource: juggler.DataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    /* @repository.getter('PermissionRepository')
    protected permissionRepositoryGetter: Getter<PermissionRepository>, */
  ) {
    super(Role, dataSource);

    this.users = this.createHasManyRepositoryFactoryFor(
      'users',
      userRepositoryGetter
    );
    this.registerInclusionResolver('users', this.users.inclusionResolver);
    /*
        this.permissons = this.createHasManyRepositoryFactoryFor(
          'permissions',
          permissionRepositoryGetter
        );

        this.registerInclusionResolver('permissions', this.permissons.inclusionResolver); */

  }
}
