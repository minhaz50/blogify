import type { NextFunction, Request, Response } from "express";
import type { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        id: string;
        name: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requriedRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error(
        "You are not looged in. Please lon in to acces this resources.",
      );
    }
    const verifiedToken = jwtUtils.verifiToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { id, email, name, role } = verifiedToken.data as JwtPayload;

    if (requriedRoles.length && !requriedRoles.includes(role)) {
      throw new Error(
        "Forbidden. You don't have permission to access this resources.",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        name,
        role,
      },
    });

    if (!user) {
      throw new Error("User not found. Please log in again.");
    }

    if (user.activeStatus === "BLOCKED") {
      throw new Error("Your account has been blocked. Please contact support");
    }

    req.user = {
      id,
      email,
      name,
      role,
    };
    next();
  });
};
