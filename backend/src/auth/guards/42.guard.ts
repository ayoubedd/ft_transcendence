import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class FTGuard extends AuthGuard('oauth2') implements CanActivate {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
