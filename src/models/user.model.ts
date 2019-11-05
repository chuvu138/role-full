import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Role, RoleWithRelations } from './role.model';
import { UserPermission } from '../authorization';
//strictObjectIDCoercion: true thi moi su dung duoc hasMany trong role
@model({
  settings: {
    // strictObjectIDCoercion: true,
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
      uniqueUsername: {
        keys: {
          username: 1,
        },
        options: {
          unique: true,
        },
      },
      uniqueSecretKey: {
        keys: {
          secret_key: 1,
        },
        options: {
          unique: true,
        },
      },


    },
  }
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
  })
  first_name?: string;

  @property({
    type: 'string',
  })
  last_name?: string;

  @property({
    type: 'string',
  })
  app_id?: string;

  @property({
    type: 'string',
  })
  secret_key?: string;

  /*   @property.array(String)
    permissions: UserPermission[]; */

  @belongsTo(() => Role)
  roleId: string;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
  role?: RoleWithRelations;
}

export type UserWithRelations = User & UserRelations;
