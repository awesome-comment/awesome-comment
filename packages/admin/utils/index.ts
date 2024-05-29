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
