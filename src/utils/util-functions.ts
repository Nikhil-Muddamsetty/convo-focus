import * as Sentry from '@sentry/nestjs';
import { UnhandeledError } from './util-class';

export function sendExceptionToSentry(error: Error) {
  console.error('error', error?.message, error);
  Sentry.captureException(error);
}

export function controllerErrorHandler(error: Error) {
  if (error instanceof UnhandeledError) {
    throw error;
  } else {
    throw new UnhandeledError(error);
  }
}
