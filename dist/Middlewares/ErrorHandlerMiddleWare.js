"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../errors/index");
const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
const errorHandlerMiddleWare = (err, req, res, next) => {
    // handle zod validation errors
    if (err instanceof zod_1.ZodError) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            msg: "Validation failed",
            errors: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
    }
    if (err instanceof index_1.CustomApiError) {
        return res.status(err.statusCode).json({ msg: err.message });
    }
    // fallback for other errors
    console.error(err);
    return res
        .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
        .send("something went wrong, try again later");
};
exports.default = errorHandlerMiddleWare;
