import { Request, Response, NextFunction } from "express";
import colors from "colors";
import { NODE_ENV } from "@conf/env";

export interface IError {
  message?: string;
  status?: number;
  stack?: string;
}

export const errorHandler = async (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const message = err.message || "Something went wrong";

  console.log(
    colors.red(`EH: ${req.method} ${req.originalUrl} ${err.message as string}`)
  );
  console.log(colors.red(`EH-stack: ${err.stack as string}`));

  res.status(statusCode).json({
    message,
    stack: NODE_ENV === "production" ? null : err.stack,
  });
};
