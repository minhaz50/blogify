import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { postController } from "./post.controller";

const router = Router();

router.post(
  "/",
  auth(Role.USER, Role.AUTHOR, Role.ADMIN),
  postController.createPost,
);

router.get("/", postController.getAllPosts);

router.get("/stats", auth(Role.ADMIN), postController.getPostStats);

router.get(
  "/my-post",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  postController.getMyPost,
);

router.get("/:postId", postController.getPostById);

router.patch(
  "/:postId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.updatePost,
);

router.delete(
  "/:postId",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postController.deletePost,
);

export const postRoutes = router;
