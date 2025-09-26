"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const http_status_codes_1 = require("http-status-codes");
const CustomApiError_1 = require("./CustomApiError");
class NotFoundError extends CustomApiError_1.CustomApiError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
    }
}
exports.NotFoundError = NotFoundError;
