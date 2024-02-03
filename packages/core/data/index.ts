export enum CommentStatus {
  Pending,
  Approved,
  Rejected,
  UnReplied = 255,
  'Replied to Admin',
}

export const MarkdownLinkRegex = /(?<!!)\[([^\]]+)]\(([^\s)]+)(?:\s+"[^"]*")?\)/;
