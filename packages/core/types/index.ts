import { CommentStatus, CommentTag } from '../data';

export type ToggleableRule = {
  enabled: boolean;
  exclude?: string;
  include?: string;
}
export type AcConfig = {
  adminEmails: string[];
  adminDisplayName: string;
  adminDisplayAvatar: string;
  autoApprove: ToggleableRule;
  shortcutEmojis: string[];
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
  posts?: number[];
  ip?: string;
  custom?: unknown;
  extra?: unknown;
}
export type CommentUser = {
  avatar: string;
  email: string;
  name: string;
}

type BaseComment = {
  id?: number;
  post_id: string;
  content: string;
  user_id: string;
  parent_id?: number;
  ancestor_id?: number;
  status: CommentStatus;
  translation?: string;
  tags?: CommentTag[];
  children?: Comment[];
  created_at?: string;
  like?: number;
}
export type Comment = BaseComment & {
  ancestorId?: number;
  createdAt: Date;
  isNew?: boolean;
  isAdmin?: boolean;
  parentId?: number;
  postId: string;
  user?: CommentUser;
  userId: string;
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

export type StatDailyByUser = {
  from: string;
  stat_date: string;
  user_id: string;
  total: number;
  posts: number;
  user_info: string;
  userInfo: {
    avatar: string;
    email: string;
    name: string;
  };
}

export type VoteItem = {
  like: number;
  dislike: number;
  ip: Record<string, number[]>;
}

export type AwesomeUser = {
  sub: string;
  email: string;
  picture: string;
  name: string;
  given_name: string;
  family_name: string;
}

export type PostCommentRequest = {
  postId: string;
  ancestorId?: number;
  parentId?: number;
  comment: string;
  domain: string;
  status?: CommentStatus;
  window?: string;
  customData?: unknown;
  extraData?: unknown;
}
