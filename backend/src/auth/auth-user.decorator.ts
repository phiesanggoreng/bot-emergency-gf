import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface AuthUserPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

export type RequestWithUser = Request & { user?: AuthUserPayload };

/**
 * Custom decorator to extract the authenticated user from the request.
 * Use this in controller methods to get the user info from the verified JWT.
 *
 * Usage:
 *   @Get()
 *   getStuff(@AuthUser() user: AuthUserPayload) { ... }
 */
export const AuthUser = createParamDecorator(
  (data: keyof AuthUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data && user) {
      return user[data];
    }

    return user;
  },
);
