import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwoFaGuard extends AuthGuard('jwt-2fa') {}
