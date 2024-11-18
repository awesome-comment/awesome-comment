export type UserAgentInfo = {
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}

export type AiPromptTemplate = {
  id: number;
  title: string;
  content: string;
  owner: string;
  allowed_emails: string[];
  created_at?: number;
  updated_at?: number;
}

export type MyAdminConfig = {
  fixedAiTemplates: number[];
  aiTemplateShortcuts: Record<string, string>;
  autoSubmit: number[];
}
