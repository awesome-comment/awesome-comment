import { Marked, type Tokens } from 'marked';

const SAFE_LINK_PROTOCOL = /^(https?:|mailto:|tel:)/i;
const SAFE_IMAGE_PROTOCOL = /^(https?:)/i;

function createSanitizedMarkdownParser() {
  const marked = new Marked({
    gfm: true,
    breaks: true,
    async: false,
    renderer: {
      html(): string {
        return '';
      },
      link({ href, title, text }: Tokens.Link): string {
        if (!href || !SAFE_LINK_PROTOCOL.test(href)) {
          return text;
        }
        const titleAttribute = title ? ` title="${title}"` : '';
        return `<a href="${href}"${titleAttribute} target="_blank" rel="noopener">${text}</a>`;
      },
      image({ href, title, text }: Tokens.Image): string {
        if (!href || !SAFE_IMAGE_PROTOCOL.test(href)) {
          return text;
        }
        const titleAttribute = title ? ` title="${title}"` : '';
        return `<img src="${href}" alt="${text || ''}"${titleAttribute} loading="lazy" />`;
      },
    },
  });

  return function parseMarkdown(content?: string | null): string {
    if (!content) {
      return '';
    }
    return marked.parse(content) as string;
  };
}

export const parseMarkdown = createSanitizedMarkdownParser();
