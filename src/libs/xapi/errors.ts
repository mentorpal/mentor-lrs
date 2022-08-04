export class InvalidXapiFormatError extends Error {
  status: number;
  constructor(message = "invalid xapi format", status = 400) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidXapiFormatError.prototype);
    this.status = status;
  }
}

export class XapiObjectNotFound extends Error {
  status: number;
  constructor(message = "invalid xapi format", status = 404) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, XapiObjectNotFound.prototype);
    this.status = status;
  }
}

export class XapiWrongUser extends Error {
  status: number;
  constructor(
    message = "attempt to save a record for a user different from the authorized user",
    status = 403
  ) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, XapiWrongUser.prototype);
    this.status = status;
  }
}
