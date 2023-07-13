import { CommentStatus } from '../data';

export type ResponseBody<T> = {
  code: number;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
  };
}

type BaseComment = {
  id: number;
  postId: string;
  content: string;
  userId: string;
  parentId?: number;
  ancestorId?: number;
  status: CommentStatus;
}
export type Comment = BaseComment & {
  createdAt: Date;
  user?: {
    email: string;
    name: string;
    avatar: string;
  };
  isNew?: boolean;
}
export type ResponseComment = BaseComment & {
  created_at: string;
  user?: string;
}

export type User = {
  id: string;
  name: string;
  nickname: string;
  picture: string;
  email: string;
  sub: string;
}
