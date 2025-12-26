// 翻译服务相关的环境变量扩展
// 这些变量需要在 Cloudflare Worker 的 secrets 或环境变量中配置

declare namespace Cloudflare {
  interface Env {
    // 翻译服务 Provider 类型: 'google' | 'openai'，默认为 'google'
    TRANSLATE_PROVIDER?: string;
    // 翻译使用的模型，如果不设置会使用各 provider 的默认模型
    TRANSLATE_MODEL?: string;
    // OpenAI API Key，使用 OpenAI provider 时必填
    OPENAI_API_KEY?: string;
  }
}
