import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceError } from '../util-class';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof ServiceError) {
          throw new BadRequestException(data);
        } else {
          return {
            success: true,
            statusCode: context.switchToHttp().getResponse().statusCode ?? 200,
            message: data.message ?? null,
            data: data?.data ?? null,
            timestamp: new Date().toISOString(),
          };
        }
      }),
    );
  }
}
