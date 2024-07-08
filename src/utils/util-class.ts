import { sendExceptionToSentry } from './util-functions';

export class CustomError extends Error {
  constructor(message: any, name: 'UnhandeledError') {
    super(message);
    this.name = name;
  }
}

export class UnhandeledError extends CustomError {
  constructor(message: any, sendToSentry: boolean = true) {
    super(
      message instanceof Error ? message.message : message,
      'UnhandeledError',
    );
    if (sendToSentry) {
      sendExceptionToSentry(message);
    }
  }
}

// export class UnhandeledError extends CustomError {
//   originalStack?: string;

//   constructor(message: any, sendToSentry: boolean = true) {
//     // Check if message is an Error object
//     if (message instanceof Error) {
//       // Access the stack trace from the caught error
//       const originalStack = message.stack;

//       // Call super constructor with modified message (if needed)
//       super(message.message || message, 'UnhandeledError');

//       // Optionally modify or format the stack trace (if desired)

//       // Assign the captured stack trace to a property
//       this.originalStack = originalStack;
//     } else {
//       // Handle non-Error message scenario (optional)
//       super(message, 'UnhandeledError');
//     }

//     if (sendToSentry) {
//       sendExceptionToSentry(message);
//     }
//   }
// }

export class ProviderResponse {
  public success: boolean = false;
  public message: string | null = null;
  public data: any = null;

  constructor(success: boolean, message: string, data: any) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export class ServiceResponse extends ProviderResponse {
  constructor(message: string, data: any = null) {
    super(true, message, data);
  }
}

export class ServiceError extends ProviderResponse {
  constructor(message: string, data: any = null) {
    super(false, message, data);
  }
}

export class ClientError extends ProviderResponse {
  constructor(message: string, data: any = null, error: Error = null) {
    super(false, message, data);

    if (error !== null) {
      sendExceptionToSentry(error);
    }
  }
}

export class ServerError extends ProviderResponse {
  constructor(message: string, data: any = null, error: Error = null) {
    super(false, message, data);

    if (error !== null) {
      sendExceptionToSentry(error);
    }
  }
}

export class DatabaseResponse extends ProviderResponse {
  constructor(
    success: boolean,
    message: string,
    data: any = null,
    error: Error = null,
  ) {
    super(success, message, data);

    if (error !== null) {
      sendExceptionToSentry(error);
    }
  }
}
