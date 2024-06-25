export class ExpectedError extends Error {
    constructor(message: any) {
        super(message);
        this.name = 'ExpectedError';
    }
}