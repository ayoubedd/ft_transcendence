import { UsersService } from '@/users/users.service';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TwoFaPayload } from '../auth.service';

@Injectable()
export class JwtTwoFaStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(UsersService) private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  async validate({ sub, isTwoFaAuthenticated }: TwoFaPayload) {
    const user = await this.userService.findOneById(sub, sub);
    if (!user['2FA']) return { userId: user.id, username: user.username };
    if (isTwoFaAuthenticated)
      return { userId: user.id, username: user.username };
  }
}
