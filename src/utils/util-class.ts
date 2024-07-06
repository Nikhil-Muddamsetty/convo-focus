import { sendExceptionToSentry } from "./util-functions";

export class CustomError extends Error{
    constructor(message: any, name: "UnexpectedError" | "ExpectedError") {
        super(message);
        this.name = name;
      }
}

export class UnexpectedError extends CustomError {
    constructor(message: any, sendToSentry: boolean = false) {
      super(message, 'UnexpectedError');
      if(sendToSentry){
        sendExceptionToSentry(message);
    }
    }
}

export class ExpectedError extends CustomError {
    constructor(message: any, sendToSentry: boolean = true) {
        super(message, 'ExpectedError');
        if(sendToSentry){
            sendExceptionToSentry(message);
        }
    }
}

export class UnhandeledError extends CustomError {
    constructor(message: any, sendToSentry: boolean = true) {
        super(message, 'ExpectedError');
        if(sendToSentry){
            sendExceptionToSentry(message);
        }
    }
}

export class ProviderResponse {
    public success: boolean = false;
    public message: string | null = null;
    public data: any = null;
    public errorType: "CLIENT" | "SERVER" | null = null;

    constructor(success: boolean, message: string, data: any, errorType: "CLIENT" | "SERVER" | null){
        this.success = success;
        this.message = message;
        this.data = data;
        this.errorType = errorType;
    }
}

export class ServiceResponse extends ProviderResponse {
    constructor(message: string, data: any = null){
        super(true, message, data, null)
    }
}

export class ServiceError extends ProviderResponse {
    constructor(message: string, data: any = null){
        super(true, message, data, null)
    }
}


export class ClientError extends ProviderResponse {
    constructor(message: string, data: any = null, error: Error = null){
        super(false, message, data, "CLIENT")

        if(error !== null){
            sendExceptionToSentry(error);
        }
    }
}

export class ServerError extends ProviderResponse {
    constructor(message: string, data: any = null, error: Error = null){
        super(false, message, data, "SERVER")
    
        if(error !== null){
            sendExceptionToSentry(error);
        }
    }
}

export class DatabaseResponse extends ProviderResponse {
    constructor(success: boolean, message: string, data: any = null, error: Error = null){
        super(success, message, data, null);

        if(error !== null){
            sendExceptionToSentry(error);
        }
    }
}