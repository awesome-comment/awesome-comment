/**
 * Content Quality Validation Utilities
 * Validates comment content to prevent low-quality submissions
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ValidationOptions {
  maxConsecutivePunctuation?: number  // 最多连续标点符号数量
  maxConsecutiveSpaces?: number       // 最多连续空格数量
  maxConsecutiveNewlines?: number     // 最多连续换行数量
  minLength?: number                  // 最小长度
  maxLength?: number                  // 最大长度
  minWords?: number                   // 最少单词数量（英文）或字符数（中文）
  allowedPunctuation?: string[]       // 允许的标点符号列表
  blockPatterns?: RegExp[]            // 阻止的模式
}

const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  maxConsecutivePunctuation: 5,
  maxConsecutiveSpaces: 3,
  maxConsecutiveNewlines: 3,
  minLength: 5,
  maxLength: 5000,
  minWords: 1,
  allowedPunctuation: [],
  blockPatterns: [],
}

/**
 * 验证评论内容质量
 */
export function validateCommentContent(
  content: string,
  options: ValidationOptions = {}
): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []

  if (!content || typeof content !== 'string') {
    return { valid: false, errors: ['Content is required'] }
  }

  const trimmedContent = content.trim()

  // 检查最小长度
  if (trimmedContent.length < opts.minLength) {
    errors.push(`Content must be at least ${opts.minLength} characters`)
  }

  // 检查最大长度
  if (trimmedContent.length > opts.maxLength) {
    errors.push(`Content must not exceed ${opts.maxLength} characters`)
  }

  // 检查连续标点符号
  const consecutivePunctuationResult = checkConsecutivePunctuation(
    trimmedContent,
    opts.maxConsecutivePunctuation
  )
  if (!consecutivePunctuationResult.valid) {
    errors.push(...consecutivePunctuationResult.errors)
  }

  // 不能有连续字母
  if (/^\w{35,}$/.test(trimmedContent)) {
    errors.push('Content contains too many consecutive letters')
  }

  // 检查连续空格
  const consecutiveSpacesResult = checkConsecutiveSpaces(
    trimmedContent,
    opts.maxConsecutiveSpaces
  )
  if (!consecutiveSpacesResult.valid) {
    errors.push(...consecutiveSpacesResult.errors)
  }

  // 检查连续换行
  const consecutiveNewlinesResult = checkConsecutiveNewlines(
    trimmedContent,
    opts.maxConsecutiveNewlines
  )
  if (!consecutiveNewlinesResult.valid) {
    errors.push(...consecutiveNewlinesResult.errors)
  }

  // 检查最少单词/字符数量
  const minWordsResult = checkMinWords(trimmedContent, opts.minWords)
  if (!minWordsResult.valid) {
    errors.push(...minWordsResult.errors)
  }

  // 检查自定义阻止模式
  if (opts.blockPatterns.length > 0) {
    const blockPatternsResult = checkBlockPatterns(trimmedContent, opts.blockPatterns)
    if (!blockPatternsResult.valid) {
      errors.push(...blockPatternsResult.errors)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 检查连续标点符号
 */
function checkConsecutivePunctuation(
  content: string,
  maxConsecutive: number
): ValidationResult {
  const errors: string[] = []

  // 常见标点符号
  const punctuations = ['!', '?', '.', ',', ';', ':', '！', '？', '。', '，', '；', '：', '…', '~', '～']

  for (const punct of punctuations) {
    const regex = new RegExp(`\\${punct}{${maxConsecutive + 1},}`, 'g')
    const matches = content.match(regex)

    if (matches) {
      errors.push(
        `Too many consecutive "${punct}" (max ${maxConsecutive}). Found: ${matches[ 0 ]}`
      )
    }
  }

  // 检查混合标点符号连续出现
  const mixedPunctuationRegex = new RegExp(`[${punctuations.join('')}]{${maxConsecutive + 1},}`, 'g');
  const mixedMatches = content.match(mixedPunctuationRegex)
  if (mixedMatches) {
    errors.push(
      `Too many consecutive punctuation marks (max ${maxConsecutive}). Found: ${mixedMatches[ 0 ]}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 检查连续空格
 */
function checkConsecutiveSpaces(
  content: string,
  maxConsecutive: number
): ValidationResult {
  const regex = new RegExp(` {${maxConsecutive + 1},}`, 'g')
  const matches = content.match(regex)

  if (matches) {
    return {
      valid: false,
      errors: [`Too many consecutive spaces (max ${maxConsecutive})`],
    }
  }

  return { valid: true, errors: [] }
}

/**
 * 检查连续换行
 */
function checkConsecutiveNewlines(
  content: string,
  maxConsecutive: number
): ValidationResult {
  const regex = new RegExp(`\n{${maxConsecutive + 1},}`, 'g')
  const matches = content.match(regex)

  if (matches) {
    return {
      valid: false,
      errors: [`Too many consecutive line breaks (max ${maxConsecutive})`],
    }
  }

  return { valid: true, errors: [] }
}

/**
 * 检查最少单词/字符数量
 */
function checkMinWords(content: string, minWords: number): ValidationResult {
  // 移除多余空格和标点
  const cleaned = content.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim()

  // 检测是否为中文为主的内容
  const chineseChars = cleaned.match(/[\u4e00-\u9fa5]/g)
  const isChinese = chineseChars && chineseChars.length > cleaned.length * 0.3

  if (isChinese) {
    // 中文：计算有效字符数（排除空格）
    const validChars = cleaned.replace(/\s+/g, '').length
    if (validChars < minWords) {
      return {
        valid: false,
        errors: [`Content must contain at least ${minWords} characters`],
      }
    }
  } else {
    // 英文：计算单词数
    const words = cleaned.split(/\s+/).filter(w => w.length > 0)
    if (words.length < minWords) {
      return {
        valid: false,
        errors: [`Content must contain at least ${minWords} words`],
      }
    }
  }

  return { valid: true, errors: [] }
}

/**
 * 检查阻止模式
 */
function checkBlockPatterns(
  content: string,
  patterns: RegExp[]
): ValidationResult {
  const errors: string[] = []

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      errors.push(`Content contains blocked pattern: ${pattern.source}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 清理内容（自动修复一些问题）
 */
export function sanitizeContent(
  content: string,
  options: ValidationOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let cleaned = content

  // 移除首尾空白
  cleaned = cleaned.trim()

  // 压缩连续空格
  cleaned = cleaned.replace(/ {4,}/g, '   ')

  // 压缩连续换行
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')

  // 压缩连续标点符号（保留最多5个）
  const punctuations = ['!', '?', '.', ',', ';', ':', '！', '？', '。', '，', '；', '：', '…', '~', '～']
  for (const punct of punctuations) {
    const regex = new RegExp(`\\${punct}{${opts.maxConsecutivePunctuation + 1},}`, 'g')
    cleaned = cleaned.replace(regex, punct.repeat(opts.maxConsecutivePunctuation))
  }

  return cleaned
}

/**
 * 预设配置
 */
export const VALIDATION_PRESETS = {
  // 宽松模式：允许更多表达自由
  lenient: {
    maxConsecutivePunctuation: 10,
    maxConsecutiveSpaces: 5,
    maxConsecutiveNewlines: 5,
    minLength: 1,
    minWords: 1,
  } as ValidationOptions,

  // 标准模式：平衡质量和自由度
  standard: {
    maxConsecutivePunctuation: 5,
    maxConsecutiveSpaces: 3,
    maxConsecutiveNewlines: 3,
    minLength: 2,
    minWords: 2,
  } as ValidationOptions,

  // 严格模式：保证高质量评论
  strict: {
    maxConsecutivePunctuation: 3,
    maxConsecutiveSpaces: 2,
    maxConsecutiveNewlines: 2,
    minLength: 10,
    minWords: 3,
  } as ValidationOptions,
}

/**
 * 获取内容统计信息
 */
export function getContentStats(content: string) {
  const trimmed = content.trim()
  const chineseChars = trimmed.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const englishWords = trimmed.match(/\b[a-zA-Z]+\b/g)?.length || 0
  const punctuation = trimmed.match(/[^\p{L}\p{N}\s]/gu)?.length || 0
  const spaces = trimmed.match(/\s/g)?.length || 0
  const newlines = trimmed.match(/\n/g)?.length || 0

  return {
    length: trimmed.length,
    chineseChars,
    englishWords,
    punctuation,
    spaces,
    newlines,
    isChinese: chineseChars > trimmed.length * 0.3,
  }
}
