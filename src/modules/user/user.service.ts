import config from "../../config";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import type { RegisterUserPayload } from "./user.interface";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto } = payload;

  const isUserExit = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (isUserExit) {
    throw new Error("User with this email already exists.");
  }

  // Hash password
  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  // create user

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    },
  });

  // create profile
  await prisma.profile.create({
    data: {
      userId: createdUser.id,
      profilePhoto,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });
  return user;
};

export const userService = {
  registerUserIntoDB,
};
