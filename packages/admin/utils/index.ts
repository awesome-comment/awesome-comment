import type { Comment } from '@awesome-comment/core/types';
import { ChineseLanguageName, LanguageName } from '~/data/lang';

export function replaceTemplate(template: string, comment: Comment, title: string): string {
  const lang = comment?.postId.replace(/\/$/, '').split('/').pop();
  return template.replace(/%(\w+)%/ig, (match, key) => {
    switch (key) {
      case 'TITLE':
        return title;
      case 'LANG_LOCAL':
        return ChineseLanguageName[ lang ] ?? '';
      case 'LANG_EN':
        return LanguageName[ lang ] ?? '';
      case 'USERNAME':
        return comment.user?.name || comment.user?.email || '';
      case 'COMMENT':
        return comment.content ?? '';
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
