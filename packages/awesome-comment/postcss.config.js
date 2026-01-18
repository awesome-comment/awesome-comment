import tailwindcssNesting from 'tailwindcss/nesting/index.js';
import tailwindcss from 'tailwindcss';
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
      const selectors = rule.selector.split(',').map((selector) => selector.trim());
      rule.selector = selectors.map(prefixSelector).join(', ');
    },
  };
}
scopeAwesomeCommentStyles.postcss = true;

function prefixSelector(selector) {
  if (!selector) return selector;
  if (selector.includes(SCOPE_SELECTOR)) return selector;
  if (selector === ':root') return SCOPE_SELECTOR;
  if (selector.startsWith(':root')) {
    return `${SCOPE_SELECTOR}${selector.slice(':root'.length)}`;
  }
  if (selector === 'html' || selector === 'body') return SCOPE_SELECTOR;
  if (selector.startsWith('html ')) return `${SCOPE_SELECTOR} ${selector.slice('html '.length)}`;
  if (selector.startsWith('body ')) return `${SCOPE_SELECTOR} ${selector.slice('body '.length)}`;
  return `${SCOPE_SELECTOR} ${selector}`;
}

export default {
  plugins: [
    tailwindcssNesting(),
    tailwindcss(),
    scopeAwesomeCommentStyles(),
    autoprefixer(),
  ],
};
