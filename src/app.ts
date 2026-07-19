import cookieParser from "cookie-parser";
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import config from "./config";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.routes";
import { postRoutes } from "./modules/post/post.routes";
import { commentRoutes } from "./modules/comment/comment.route";
import { notfound } from "./middleware/notFound";
import httpStatus from "http-status";
import { globalError } from "./middleware/globalErrorHandler";

const app: Application = express();

// middleware
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  const user = await prisma.user.findMany();
  console.log(user);
  res.send("Blogify website");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.use(notfound);
app.use(globalError);

export default app;
