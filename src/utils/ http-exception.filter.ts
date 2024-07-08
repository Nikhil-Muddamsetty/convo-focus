import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UnhandeledError } from './util-class';
import { sendExceptionToSentry } from './util-functions';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof UnhandeledError === false) {
      console.log('heerrreee ', exception);
      sendExceptionToSentry(exception);
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status ?? 500).json({
      success: false,
      statusCode: status,
      message: exception.message ?? null,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
}
