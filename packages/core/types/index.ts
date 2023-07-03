import { CommentStatus } from '../data';

export type ResponseBody<T> = {
  code: number;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
  };
}

export type Comment = {
  id: number;
  postId: string;
  content: string;
  createdAt: string;
  userId: string;
  parentId?: number;
  ancestorId?: number;
  status: CommentStatus;
  user?: {
    email: string;
    name: string;
    avatar: string;
  };
}

export type User = {
  id: string;
  name: string;
  nickname: string;
  picture: string;
  email: string;
  sub: string;
}
