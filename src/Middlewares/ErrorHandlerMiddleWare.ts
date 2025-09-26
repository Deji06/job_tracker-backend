import { Request, Response, NextFunction } from "express";
import { CustomApiError } from "../errors/index";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

const errorHandlerMiddleWare = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // handle zod validation errors
  if (err instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof CustomApiError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }

  // fallback for other errors
  console.error(err);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send("something went wrong, try again later");
};

export default errorHandlerMiddleWare;
