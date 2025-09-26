"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomApiError = void 0;
const http_status_codes_1 = require("http-status-codes");
class CustomApiError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
exports.CustomApiError = CustomApiError;
