export enum CommentStatus {
  Pending,
  Approved,
  Rejected,
  UnReplied = 255,
  'Replied to Admin',
}

export const MarkdownLinkRegex = /(?<!!)\[([^\]]+)]\(([^\s)]+)(?:\s+"[^"]*")?\)/;

export const EmailAppendixRegex = /@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const Languages: string[] = [
  'en',
  'zh',
  'es',
  'cn',
  'ko',
  'pt',
  'ja',
  'id',
];
