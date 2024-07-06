import * as Sentry from "@sentry/nestjs"

export function sendExceptionToSentry(error: Error){
    console.error("error");
    Sentry.captureException(error);
}