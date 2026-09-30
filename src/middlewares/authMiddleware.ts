import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import ErrorWithCode from "../utils/ErrorWithCode";
import codes from "../utils/statusCode";

interface JwtPayload {
  userId: string;
  email: string;
}

const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new ErrorWithCode(
      "Authorization token is required",
      codes.unAuthorized
    );
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ErrorWithCode(
      "Invalid authorization format",
      codes.unAuthorized
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      env.jwtSecret
    ) as JwtPayload;

    req.userId = decoded.userId;

    next();
  } catch {
    throw new ErrorWithCode(
      "Invalid or expired authorization token",
      codes.unAuthorized
    );
  }
};

export default authMiddleware;
