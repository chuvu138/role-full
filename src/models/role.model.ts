import { Entity, model, property, hasMany } from '@loopback/repository';
import { User, UserWithRelations } from './user.model';

@model({
  settings: {
    indexes: {
      uniqueName: {
        keys: {
          name: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  }
})
export class Role extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;


  @property({
    type: 'array',
    itemType: 'object',
  })
  permissions?: Object[];

  @hasMany(() => User)
  users?: User[];


  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
  users?: UserWithRelations[];
}

export type RoleWithRelations = Role & RoleRelations;
