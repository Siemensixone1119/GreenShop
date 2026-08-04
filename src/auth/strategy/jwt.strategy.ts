import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import { SessionsService } from '../../sessions/sessions.service.js';
import { RequestWithCookie } from '../types/request-with-cookies.type.js';
import type { JwtPayload } from '../types/jwt-payload-data.type.js';
import type { PublicUser } from '../../users/types/public-user.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RequestWithCookie) => JwtStrategy.cookieExtractor(request),
      ]),
      secretOrKey: JwtStrategy.getJwtSecret(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<PublicUser> {
    if (!payload.sub || !payload.sessionId) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionService.findActiveById(payload.sessionId);
    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.userId !== user.id) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private static cookieExtractor(request: RequestWithCookie): string | null {
    return request.cookies?.accessToken ?? null;
  }

  private static getJwtSecret(): string {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET не задан');
    }
    return jwtSecret;
  }
}
