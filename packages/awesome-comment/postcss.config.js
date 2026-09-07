import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const SCOPE_SELECTOR = '.awesome-comment';

function scopeAwesomeCommentStyles() {
  return {
    postcssPlugin: 'awesome-comment-scope',
    Rule(rule) {
      if (!rule.selector) return;
      const parent = rule.parent;
      if (parent?.type === 'atrule' && parent.name.toLowerCase().includes('keyframes')) {
        return;
      }
      const selectors = splitSelectors(rule.selector);
      rule.selector = selectors.flatMap(scopeSelector).join(', ');
    },
  };
}
scopeAwesomeCommentStyles.postcss = true;

function splitSelectors(selector) {
  const result = [];
  let current = '';
  let parenDepth = 0;
  let bracketDepth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }
    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '(') {
        parenDepth++;
      } else if (char === ')') {
        parenDepth = Math.max(0, parenDepth - 1);
      } else if (char === '[') {
        bracketDepth++;
      } else if (char === ']') {
        bracketDepth = Math.max(0, bracketDepth - 1);
      } else if (char === ',' && parenDepth === 0 && bracketDepth === 0) {
        if (current.trim()) result.push(current.trim());
        current = '';
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function scopeSelector(selector) {
  if (!selector) return [selector];
  if (selector.includes(SCOPE_SELECTOR)) return [selector];
  if (selector === ':root' || selector === ':host') return [SCOPE_SELECTOR];
  if (selector === ':where(:root)') return [SCOPE_SELECTOR];
  if (selector.startsWith(':root:has(') && selector.endsWith(')')) {
    const suffix = selector.slice(':root'.length);
    return [`${SCOPE_SELECTOR}${suffix}`, `:root${suffix} ${SCOPE_SELECTOR}`];
  }
  if (selector.startsWith(':root')) {
    return [`${SCOPE_SELECTOR}${selector.slice(':root'.length)}`];
  }
  if (/^:where\(\s*:root\s*,\s*\[data-theme\]\s*\)$/.test(selector)) {
    return [SCOPE_SELECTOR, `[data-theme] ${SCOPE_SELECTOR}`, `${SCOPE_SELECTOR}[data-theme]`];
  }
  if (/^\[data-theme(\s*=\s*("[^"]*"|'[^']*'|[^\]"'\s]+))?\]$/.test(selector)) {
    return [`${selector} ${SCOPE_SELECTOR}`, `${SCOPE_SELECTOR}${selector}`];
  }
  if (selector === 'html' || selector === 'body') return [SCOPE_SELECTOR];
  if (selector.startsWith('html ')) return [`${SCOPE_SELECTOR} ${selector.slice('html '.length)}`];
  if (selector.startsWith('body ')) return [`${SCOPE_SELECTOR} ${selector.slice('body '.length)}`];
  return [`${SCOPE_SELECTOR} ${selector}`];
}

function prefixSelector(selector) {
  return scopeSelector(selector).join(', ');
}

export { scopeSelector, splitSelectors };
export default {
  plugins: [tailwindcss(), scopeAwesomeCommentStyles(), autoprefixer()],
};
