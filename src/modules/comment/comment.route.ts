import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { commentController } from "./comment.controller";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.createComment,
);

router.get(
  "/author/:authorId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.getCommentsByAuthorId,
);

router.get("/:commentId", commentController.getCommentById);

router.patch(
  "/:commentId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.updateComment,
);

router.delete(
  "/:commentId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  commentController.deleteComment,
);

router.patch(
  "/:commentId/moderate",
  auth(Role.ADMIN),
  commentController.updateCommentIdByModerate,
);

export const commentRoutes = router;
