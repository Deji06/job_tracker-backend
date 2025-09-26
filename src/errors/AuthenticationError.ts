import { StatusCodes } from "http-status-codes"
import { CustomApiError } from "./CustomApiError"
export class AuthenticationError extends CustomApiError {
    statusCode: StatusCodes
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}