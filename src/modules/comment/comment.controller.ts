import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id as string;
    const result = await commentService.createComment(authorId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Comment Created Successfully.",
      data: result,
    });
  },
);

const getCommentsByAuthorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;
    const result = await commentService.getCommentsByAuthorId(
      authorId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment retrived Successfully.",
      data: result,
    });
  },
);

const getCommentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const result = await commentService.getCommentById(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment Created Successfully.",
      data: result,
    });
  },
);

const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { commentId } = req.params;
    const authorId = user?.id as string;
    const payload = req.body;
    const result = await commentService.updateComment(
      commentId as string,
      payload,
      authorId,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment updated successfully",
      data: result,
    });
  },
);

const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { commentId } = req.params;
    const authorId = user?.id as string;
    const result = await commentService.deleteComment(
      commentId as string,
      authorId,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment deleted successfully",
      data: result,
    });
  },
);

const updateCommentIdByModerate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;
    const payload = req.body;
    const result = await commentService.moderateComment(
      commentId as string,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment moderated successfully",
      data: result,
    });
  },
);

export const commentController = {
  createComment,
  getCommentsByAuthorId,
  getCommentById,
  updateComment,
  deleteComment,
  updateCommentIdByModerate,
};
