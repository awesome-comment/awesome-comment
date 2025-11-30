import i18n from '../i18n.json' with { type: 'json' };

export enum CommentStatus {
  Pending,
  Approved,
  Rejected,
  UnReplied = 255,
  'Replied to Admin',
}

export const CommentTags = [
  'Greeting',
  'Bug report',
  'Question',
  'Suggestion',
  'Criticism',
] as const;

export type CommentTag = typeof CommentTags[number];

export const MarkdownLinkRegex = /(?<!!)\[([^\]]+)]\(([^\s)]+)(?:\s+"[^"]*")?\)/;

export const EmailAppendixRegex = /@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const Languages: string[] = Object.keys(i18n);

export const POST_INTERVAL = 9E5; // 15 minutes
