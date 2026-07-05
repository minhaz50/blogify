import { prisma } from "../../lib/prisma";
import type { ILoginUser } from "./auth.interface";
import bcrypt from "bcrypt";

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password is incorrcet.");
  }

  return user;
};

export const authService = {
  loginUser,
};
