import { CommentStatus } from '../data';

export type ToggleableRule = {
  enabled: boolean;
  exclude?: string;
  include?: string;
}
export type AcConfig = {
  adminEmails: string[];
  autoApprove: ToggleableRule;
}

export type ResponseBody<T> = {
  code: number;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    config?: AcConfig;
  };
}

export type User = {
  id: string;
  name: string;
  nickname: string;
  picture: string;
  email: string;
  sub: string;
  avatar: string;
  agent?: string;
  window?: string;
}
export type CommentUser = {
  avatar: string;
  email: string;
  name: string;
}

type BaseComment = {
  id?: number;
  postId: string;
  content: string;
  userId: string;
  parentId?: number;
  ancestorId?: number;
  status: CommentStatus;
  children?: Comment[];
  created_at?: string;
}
export type Comment = BaseComment & {
  createdAt: Date;
  user?: CommentUser;
  isNew?: boolean;
  isAdmin?: boolean;
}
export type ResponseComment = BaseComment & {
  created_at: string;
  parent_id?: number;
  ancestor_id?: number;
  user_id: string;
  post_id: string;
}
export type PostCount = {
  post_id: string;
  comment_count: number;
}

export type StatDailyByLanguage = {
  date: string;
  lang: string;
  total: number;
}
