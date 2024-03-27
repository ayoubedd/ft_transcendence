import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GoogleGuard } from './google.guard';
import { FTGuard } from './42.guard';

@Injectable()
export class OAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const strategy = request.query.strategy;

    if (strategy === 'google') return new GoogleGuard().canActivate(context);

    if (strategy === '42') return new FTGuard().canActivate(context);

    return false;
  }
}
