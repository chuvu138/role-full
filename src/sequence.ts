import { inject } from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
  HttpErrors,
} from '@loopback/rest';
import { AuthenticationBindings, AuthenticateFn, AUTHENTICATION_STRATEGY_NOT_FOUND, USER_PROFILE_NOT_FOUND } from '@loopback/authentication';
import { UserProfile, securityId } from '@loopback/security';
import { AuthorizationBindings, UserPermissionsFn, AuthorizeFn, AuthorizeErrorKeys, PermissionKey } from './authorization';
import { UserRepository } from './repositories';
import { repository } from '@loopback/repository';
import { User } from './models';

const SequenceActions = RestBindings.SequenceActions;


export class MyAuthenticationSequence implements SequenceHandler {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) protected send: Send,
    @inject(SequenceActions.REJECT) protected reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,

    /*     @inject(AuthenticationBindings.AUTH_ACTION)
        protected authenticateRequest: AuthenticateFn, */
    @inject(AuthorizationBindings.USER_PERMISSIONS)
    protected fetchUserPermissons: UserPermissionsFn,
    @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    protected checkAuthorization: AuthorizeFn,
  ) { }

  async handle(context: RequestContext) {
    try {
      const { request, response } = context;
      const route = this.findRoute(request);

      //call authentication action
      const authUser: UserProfile | undefined = await this.authenticateRequest(request);
      console.log(authUser)

      if (authUser != undefined) {
        /* const findUser = await this.userRepository.findById(authUser[securityId], { include: [{ relation: 'role' }] })
        if (findUser.role) {
          console.log(typeof findUser.role.permissions)
          console.log(findUser.role.permissions)
          console.log()

        } */
        const permissions: PermissionKey[] = this.fetchUserPermissons(
          [{
            permission: PermissionKey.ViewTodo,
            allowed: true
          }],
          [PermissionKey.ViewTodo],
        );

        const isAccessAllowed: boolean = await this.checkAuthorization(
          permissions,
        );

        if (!isAccessAllowed) {
          throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
        }

      }
      /* if (authUser != undefined) {
        const permissions: PermissionKey[] = this.fetchUserPermissons(
          authUser.permissions,
          authUser.role.permissions,
        );

        // This is main line added to sequence
        // where we are invoking the authorize action function to check for access
        const isAccessAllowed: boolean = await this.checkAuthorization(
          permissions,
        );

        if (!isAccessAllowed) {
          throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
        }
      } */



      // Authentication successful, proceed to invoke controller
      const args = await this.parseParams(request, route);

      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      //
      // The authentication action utilizes a strategy resolver to find
      // an authentication strategy by name, and then it calls
      // strategy.authenticate(request).
      //
      // The strategy resolver throws a non-http error if it cannot
      // resolve the strategy. When the strategy resolver obtains
      // a strategy, it calls strategy.authenticate(request) which
      // is expected to return a user profile. If the user profile
      // is undefined, then it throws a non-http error.
      //
      // It is necessary to catch these errors and add HTTP-specific status
      // code property.
      //
      // Errors thrown by the strategy implementations already come
      // with statusCode set.
      //
      // In the future, we want to improve `@loopback/rest` to provide
      // an extension point allowing `@loopback/authentication` to contribute
      // mappings from error codes to HTTP status codes, so that application
      // don't have to map codes themselves.
      if (
        error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        error.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error, { statusCode: 401 /* Unauthorized */ });
      }

      this.reject(context, error);
      return;
    }
  }
}


export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) { }

  async handle(context: RequestContext) {
    try {
      const { request, response } = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }
  }
}
