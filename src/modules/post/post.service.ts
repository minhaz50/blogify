import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import type { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type {
  ICreatePostPayload,
  IPostQuery,
  IUpdataePayload,
} from "./post.interface";

const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;

  const tagsArray = Array.isArray(tags) ? tags : [];

  const andConditons: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditons.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditons.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditons.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditons.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditons.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.tags) {
    andConditons.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditons.push({
      status: query.status,
    });
  }

  const posts = await prisma.post.findMany({
    // filtering or exact match
    // where: {
    //   AND: [
    //     {
    //       title: "My Fourth Post",
    //     },
    //     {
    //       content: "Backend technologies",
    //     },
    //     {
    //       tags: {
    //         // equals: ["typescript", "prisma", "node", "express"],
    //         has: "typescript",
    //       },
    //     },
    //   ],
    // },

    // Searching or partial match
    // where: {
    //   OR: [
    //     {
    //       title: {
    //         contains: "Next",
    //         mode: "insensitive",
    //       },
    //     },
    //     {
    //       content: {
    //         contains: "Next",
    //         mode: "insensitive",
    //       },
    //     },
    //   ],
    // },

    // Searching and partial match combined

    // where: {
    //   AND: [
    //     {
    // searching
    //       OR: [
    //         {
    //           title: {
    //             contains: "Ron",
    //             mode: "insensitive",
    //           },
    //         },

    //         {
    //           content: {
    //             contains: "Ron",
    //             mode: "insensitive",
    //           },
    //         },
    //       ],
    //     },

    // filtering
    //     {
    //       title: "Ronaldo Nazario",
    //     },

    //     {
    //       content: "Ronaldo",
    //     },
    //   ],
    // },

    // where: {
    //   AND: [
    //     query.searchTerm
    //       ? {
    //           OR: [
    //             {
    //               title: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //             {
    //               content: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //           ],
    //         }
    //       : {},

    //     query.title ? { title: query.title } : {},
    //     query.content ? { content: query.content } : {},
    //   ],
    // },

    where: {
      AND: andConditons,
    },

    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return posts;
};

const getPostById = async (postId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const post = await prisma.post.findUniqueOrThrow({
      where: {
        id: postId,
      },

      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: { status: CommentStatus.APPROVED },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  });
  return transactionResult;
};

const getPostStats = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectComments,
      totalPostViewsAggregate,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      await tx.comment.count(),
      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      await tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),
      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);
    return {
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectComments,
      totalPostViews: totalPostViewsAggregate._sum.views,
    };
  });
  return transactionResult;
};

const getMyPost = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      comments: true,

      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  return result;
};

const updatePost = async (
  postId: string,
  payload: IUpdataePayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post.");
  }

  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return result;
};

const deletePost = async (
  postId: string,
  auhtorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== auhtorId) {
    throw new Error("You are not the owner of this post");
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostById,
  getPostStats,
  getMyPost,
  updatePost,
  deletePost,
};
