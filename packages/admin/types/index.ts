export type AiPromptTemplate = {
  title: string;
  template: string;
  isFix?: boolean;
};

export type UserAgentInfo = {
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}
