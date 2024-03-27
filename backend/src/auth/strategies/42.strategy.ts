import { UsersService } from '@/users/users.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { firstValueFrom } from 'rxjs';
import { generateUsername } from 'unique-username-generator';

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UsersService,
    private readonly httpService: HttpService,
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: config.getOrThrow('CLIENT_ID'),
      clientSecret: config.getOrThrow('CLIENT_SECRET'),
      callbackURL: config.getOrThrow('OAUTH2_REDIRECT_URL'),
    });
  }

  async validate(accessToken: string, _: string, profile: any, cb: any) {
    try {
      profile = await this.getProfileFromIntra(accessToken);
    } catch (err) {
      return cb(err, false);
    }
    const {
      email,
      login: username,
      first_name: firstname,
      last_name: lastname,
      image: { link: avatar },
    } = profile.data;
    try {
      const user = await this.userService.findOrCreate({
        username: username.replace(' ', '-'),
        firstname,
        lastname,
        email,
        avatar,
        pub: false,
      });
      return cb(null, { id: user.id, username });
    } catch (err) {
      try {
        const user = await this.userService.findOrCreate({
          username: generateUsername('-'),
          firstname,
          lastname,
          email,
          avatar,
          pub: false,
        });
        return cb(null, user);
      } catch (err) {
        return cb(null, false);
      }
    }
    // return cb(null, false);
  }

  async getProfileFromIntra(accessToken: string): Promise<any> {
    const profileUrl = `https://api.intra.42.fr/v2/me?access_token=${accessToken}`;
    return await firstValueFrom(
      this.httpService.get(profileUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
  }
}
