import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/register", userController.registerUser);

router.get(
  "/me",
  // to understand code
  //   (req: Request, res: Response, next: NextFunction) => {
  //     const { accessToken } = req.cookies;
  //     console.log(accessToken);

  //     const verifiedToken = jwtUtils.verifiToken(
  //       accessToken,
  //       config.jwt_access_secret,
  //     );

  //     if (!verifiedToken.success) {
  //       throw new Error(verifiedToken.error);
  //     }
  //     const { id, email, name, role } = verifiedToken.data as JwtPayload;

  //     const requriedRoles = [Role.ADMIN, Role.USER, Role.AUTHOR];

  //     if (!requriedRoles.includes(role)) {
  //       return res.status(403).json({
  //         success: false,
  //         statusCode: httpStatus.FORBIDDEN,
  //         message:
  //           "Forbidden. You don't have permission to access this resource.",
  //       });
  //     }

  //     req.user = {
  //       email,
  //       name,
  //       id,
  //       role,
  //     };

  //     next();
  //   },
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  userController.getMyProfile,
);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  userController.updateMyProfile,
);

export const userRoutes = router;
