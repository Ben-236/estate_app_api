class ErrorWithCode extends Error {
  public readonly errorCode: number;

  constructor(message: string, errorCode = 500) {
    super(message);

    this.name = "ErrorWithCode";
    this.errorCode = errorCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default ErrorWithCode;