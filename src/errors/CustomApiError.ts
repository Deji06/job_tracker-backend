import { StatusCodes } from "http-status-codes"

export class CustomApiError extends Error {
    statusCode: StatusCodes
    constructor(message: string) {
        super(message)
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    }
}