import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { RequestWithUser } from './auth-user.decorator';

/**
 * NextAuth JWT Guard
 *
 * Verifies the NextAuth v4 JWT token sent in the Authorization header.
 * NextAuth uses the NEXTAUTH_SECRET to sign JWTs, so the backend must
 * share the same secret to decode and verify them.
 *
 * The decoded token payload contains: { name, email, picture, sub, iat, exp, jti }
 */
@Injectable()
export class NextAuthGuard implements CanActivate {
  private readonly logger = new Logger(NextAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan.');
    }

    try {
      const secret = this.configService.get<string>('NEXTAUTH_SECRET');
      if (!secret) {
        this.logger.error('NEXTAUTH_SECRET is not configured!');
        throw new UnauthorizedException('Server auth configuration error.');
      }

      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      // Attach user info to request for use in controllers
      request.user = {
        email: typeof decoded.email === 'string' ? decoded.email : '',
        name: typeof decoded.name === 'string' ? decoded.name : '',
        picture:
          typeof decoded.picture === 'string' ? decoded.picture : undefined,
        sub: typeof decoded.sub === 'string' ? decoded.sub : '',
      };

      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          'Token sudah kedaluwarsa. Silakan login ulang.',
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Token tidak valid.');
      }
      throw new UnauthorizedException('Gagal memverifikasi autentikasi.');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
