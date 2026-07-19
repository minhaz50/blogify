import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;

    const payload = req.body;

    const result = await postService.createPost(payload, id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Post created Successfully ",
      data: result,
    });
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    // console.log(query);
    const result = await postService.getAllPosts(query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: " Posts Retrieved Successfully",
      data: result,
    });
  },
);

const getPostStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getPostStats();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Posts stats retrived successfully. ",
      data: result,
    });
  },
);

const getPostById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;

    if (!postId) {
      throw new Error("Post Id Required In Params.");
    }

    const result = await postService.getPostById(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post Retrieved Successfully.",
      data: result,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const postId = req.params.postId;

    if (!postId) {
      throw new Error("Post Id required in params.");
    }

    const payload = req.body;

    const result = await postService.updatePost(
      postId as string,
      payload,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: " Posts Updated Successfully",
      data: result,
    });
  },
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const postId = req.params.postId;

    if (!postId) {
      throw new Error("Post Id required in params.");
    }

    const isAdmin = req.user?.role === "ADMIN";

    await postService.deletePost(postId as string, authorId as string, isAdmin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post deleted successfully.",
      data: null,
    });
  },
);

const getMyPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;

    const result = await postService.getMyPost(authorId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My Post Retrieved Successfully.",
      data: result,
    });
  },
);

export const postController = {
  createPost,
  getAllPosts,
  getPostStats,
  getMyPost,
  getPostById,
  updatePost,
  deletePost,
};
