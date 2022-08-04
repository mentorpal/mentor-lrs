/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
