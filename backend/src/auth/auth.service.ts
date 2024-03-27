import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from '@/utils/jwt-payload';
import { UserInJwtPayload } from '@/utils/user-request';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiProperty } from '@nestjs/swagger';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

export class AccessTokenResponse {
  @ApiProperty()
  access_token: string;
}

export class TwoFaPayload extends JwtPayload {
  isTwoFaEnabled: boolean;
  isTwoFaAuthenticated: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login({ id }: User): Promise<AccessTokenResponse> {
    const user = await this.userService.findOneById(id, id);
    if (!user) throw new BadRequestException('something went wrong');
    const payload: TwoFaPayload = {
      sub: user.id,
      username: user.username,
      isTwoFaEnabled: user['2FA'],
      isTwoFaAuthenticated: false,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginWithTwoFa({ id }: User) {
    const user = await this.userService.findOneById(id, id);
    if (!user) throw new BadRequestException('something went wrong');
    const payload: TwoFaPayload = {
      sub: user.id,
      username: user.username,
      isTwoFaEnabled: user['2FA'],
      isTwoFaAuthenticated: true,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async generateTwoFaAuthSecrete({ userId, username }: UserInJwtPayload) {
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(
      username,
      'ft_transcendence',
      secret,
    );
    await this.userService.setUserTwoFaSecret(userId, secret);
    return {
      secret,
      otpAuthUrl,
    };
  }

  async generateQrCodeForTwoFa(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFaCodeValid(code: string, userSecret: string) {
    return authenticator.verify({
      token: code,
      secret: userSecret,
    });
  }

  async turnOnTwoFa(userId: string, code: string) {
    const user = await this.userService.getUserByIdWithSecrete(userId);
    const valid = this.isTwoFaCodeValid(code, user.twoFaSecret);
    if (!valid) throw new BadRequestException('wrong authorization code');
    this.userService.turnOnTowFa(userId);
  }

  async TwoFaAuthenticate(userId: string, code: string) {
    const user = await this.userService.getUserByIdWithSecrete(userId);
    const valid = this.isTwoFaCodeValid(code, user.twoFaSecret);
    if (!valid) throw new BadRequestException('wrong authorization code');
    return this.loginWithTwoFa(user);
  }
}
