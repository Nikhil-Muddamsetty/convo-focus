import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(BadRequestException)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const properException = new WsException(exception.getResponse());
    super.catch(properException, host);
  }
}

@Catch(WsException)
export class WsExceptionFilter implements BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    console.log('catch exception', exception);
    const socket = host?.getArgByIndex(0);
    socket.emit('exception', {
      success: false,
      statusCode: 400,
      message: exception.message ?? null,
      data: null,
      timestamp: new Date().toISOString(),
    });
    // if (exception instanceof UnhandeledError === false) {
    //   console.log('heerrreee ', exception);
    //   sendExceptionToSentry(exception);
    // }
    // const ctx = host.switchToWs();
    // const response = ctx.getData<Response>();
  }

  handleError<TClient extends { emit: Function }>(
    client: TClient,
    exception: any,
  ): void {
    console.log('handleError exception', exception);
    client.emit('exception', {
      message: exception.message,
      status: exception.getStatus(),
    });
  }

  handleUnknownError<TClient extends { emit: Function }>(
    client: TClient,
    exception: any,
  ): void {
    console.log('handleUnknownError exception', exception);
    client.emit('exception', {
      message: exception.message,
      status: exception.getStatus(),
    });
  }

  isExceptionObject(err: any): err is Error {
    console.log('isExceptionObject err', err);
    return err instanceof Error;
  }
}
