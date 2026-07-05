import cookieParser from "cookie-parser";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import config from "./config";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { userRoutes } from "./modules/user/user.route";

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

export default app;
