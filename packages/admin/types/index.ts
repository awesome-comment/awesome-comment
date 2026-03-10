import type { Comment, CommentUser, User } from '@awesome-comment/core/types';

export type UserAgentInfo = {
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
};

export type AiPromptTemplate = {
  id: number;
  title: string;
  content: string;
  owner: string;
  allowed_emails: string[];
  created_at?: number;
  updated_at?: number;
};

export type MyAdminConfig = {
  fixedAiTemplates: number[];
  aiTemplateShortcuts: Record<string, string>;
  autoSubmit: number[];
};

export type RowItem = Comment & {
  children?: RowItem[];
  created_at: string;
  from: string;
  id: number;
  isApproving: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  isDeleted: boolean;
  isReplying: boolean;
  isShadowBanning: boolean;
  toContent?: string;
  toUser?: CommentUser;
  user: User;
};
