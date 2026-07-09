import { Reflector } from "@nestjs/core";
import { Roles } from "../decorators/roles.decorator.js";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector){}

  canActivate(context: ExecutionContext){
    const roles = this.reflector.get(Roles, context.getHandler())

    if(!roles){
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user

    return this.matchRoles(roles, user.role)
  }

  private matchRoles(requiresRole: string[], userRole: string): boolean{
    return requiresRole.includes(userRole)
  }
}