export class LoginError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LoginError";
    }
}

export class LoginDeniedError extends LoginError {
    constructor() {
        super("The sign-in request was denied");
        this.name = "LoginDeniedError";
    }
}

export class LoginExpiredError extends LoginError {
    constructor() {
        super("The code expired before it was approved");
        this.name = "LoginExpiredError";
    }
}

export class LoginFailedError extends LoginError {
    constructor(description?: string) {
        super(description ?? "The server rejected the sign-in");
        this.name = "LoginFailedError";
    }
}
