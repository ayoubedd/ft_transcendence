import { UsersService } from '@/users/users.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import { generateUsername } from 'unique-username-generator';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UsersService,
    private readonly httpService: HttpService,
  ) {
    super({
      clientID: config.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow('GOOGLE_REDIRECT_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ) {
    const {
      email: email,
      name: username,
      picture: avatar,
      given_name: firstname,
    } = profile._json;
    const lastname = profile._json?.family_name || '';
    try {
      const user = await this.userService.findOrCreate({
        username: username?.replace(' ', '-') || '',
        firstname: firstname || '',
        lastname: lastname || '',
        email: email || '',
        avatar: avatar || '',
        pub: false,
      });
      return cb(null, { id: user.id, username });
    } catch (err) {
      try {
        const user = await this.userService.findOrCreate({
          username: generateUsername('-'),
          firstname: firstname || '',
          lastname: lastname || '',
          email: email || '',
          avatar: avatar || '',
          pub: false,
        });
        return cb(null, user);
      } catch (err) {
        return cb(err, false);
      }
    }
    cb(null, false);
  }
}
