import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { verify as verifyJwtToken } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { jwtConstants } from 'src/auth/constants';

@Injectable()
export class GatewayGuard implements CanActivate {
  jwtSecret = jwtConstants.secret;
  verifyJwtTokenOptions = {
    ignoreExpiration: false,
  };

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToWs();
      const { Authorization } = request.getData();
      const authToken = Authorization.split(' ')[1];
      const verifyJwtTokenResult = verifyJwtToken(
        authToken,
        this.jwtSecret,
        this.verifyJwtTokenOptions,
      );
      console.log('verifyJwtTokenResult', verifyJwtTokenResult);
      context.switchToHttp().getRequest().user = verifyJwtTokenResult;
      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }
}
