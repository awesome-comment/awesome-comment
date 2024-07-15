import type { Comment } from '@awesome-comment/core/types';
import { LocalLanguageName, LanguageName } from '~/data/lang';
import type { UserAgentInfo } from '~/types';

export function replaceTemplate(
  template: string,
  comment: Comment,
  title: string,
  reply: string,
): string {
  const lang = comment?.postId.replace(/\/$/, '').split('/').pop();
  return template.replace(/%(\w+)%/ig, (match, key) => {
    switch (key) {
      case 'TITLE':
        return title;
      case 'LANG_LOCAL':
        return LocalLanguageName[ lang ] ?? '';
      case 'LANG_EN':
        return LanguageName[ lang ] ?? '';
      case 'USERNAME':
        return comment.user?.name || comment.user?.email || '';
      case 'COMMENT':
        return comment.content ?? '';
      case 'CURRENT_COMMENT':
        return reply;
      default:
        return match;
    }
  });
}

export async function writeToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return ;
    } catch (e) {
      // do nothing
    }
  }

  // 回退到旧的方法
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // 防止元素影响页面布局
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.execCommand('copy');
  document.body.removeChild(textArea);
}

export function parseUserAgent(userAgent: string): UserAgentInfo {
  const result: UserAgentInfo = {
    deviceType: '',
    browser: '',
    browserVersion: '',
    os: '',
    osVersion: ''
  };

  // Determine device type
  const mobileRegex = /Mobile|Android|iP(ad|od|hone)/;
  result.deviceType = mobileRegex.test(userAgent) ? 'Mobile / Tablet' : 'Desktop';

  // Determine browser and browser version
  const browserRegexes = [
    { name: 'Edge', regex: /Edg\/([0-9.]+)/ },
    { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', regex: /Version\/([0-9.]+).*Safari/ },
    { name: 'Opera', regex: /OPR\/([0-9.]+)/ },
    { name: 'Internet Explorer', regex: /MSIE ([0-9.]+)/ }
  ];

  for (const browser of browserRegexes) {
    const match = userAgent.match(browser.regex);
    if (match) {
      result.browser = browser.name;
      result.browserVersion = match[ 1 ];
      break;
    }
  }

  // Determine OS and OS version
  const osRegexes = [
    { name: 'Windows', regex: /Windows NT ([0-9.]+)/ },
    { name: 'Mac OS', regex: /Mac OS X ([0-9_]+)/ },
    { name: 'iOS', regex: /iP(hone|od|ad).*OS ([0-9_]+)/ },
    { name: 'Android', regex: /Android ([0-9.]+)/ },
    { name: 'Linux', regex: /Linux/ }
  ];

  for (const os of osRegexes) {
    const match = userAgent.match(os.regex);
    if (match) {
      result.os = os.name;
      result.osVersion = match[ 1 ]?.replace(/_/g, '.') || '';
      break;
    }
  }

  return result;
}
