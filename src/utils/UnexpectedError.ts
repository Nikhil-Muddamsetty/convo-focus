export class UnexpectedError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'UnexpectedError';
  }
}