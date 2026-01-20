Awesome comment
===============


Usage
-----

## ESM 外部依赖构建

执行 `pnpm -C packages/awesome-comment build:esm` 会生成外部依赖版的 ESM 构建，产物在 `packages/awesome-comment/dist/esm`。
该构建会把第三方库改为外部依赖，需要你在页面中提前提供这些模块（推荐使用 import map）。

示例（仅供参考，版本请按需替换）：

```html
<script type="importmap">
{
  "imports": {
    "vue": "https://cdn.jsdelivr.net/npm/vue@3.5.26/dist/vue.runtime.esm-browser.js",
    "pinia": "https://cdn.jsdelivr.net/npm/pinia@3.0.4/dist/pinia.esm-browser.js",
    "vue-i18n": "https://cdn.jsdelivr.net/npm/vue-i18n@11.2.8/dist/vue-i18n.esm-browser.js",
    "@auth0/auth0-vue": "https://cdn.jsdelivr.net/npm/@auth0/auth0-vue@2.5.0/dist/auth0-vue.esm-browser.js",
    "lodash-es": "https://cdn.jsdelivr.net/npm/lodash-es@4.17.22/lodash.js",
    "marked": "https://cdn.jsdelivr.net/npm/marked@17.0.1/lib/marked.esm.js",
    "lucide-vue-next": "https://cdn.jsdelivr.net/npm/lucide-vue-next@0.544.0/dist/esm/lucide-vue-next.js"
  }
}
</script>
```

注意：`@awesome-comment/core` 与 `@roudanio/awesome-auth` 仍会打包进产物内。

## ESM unpkg 版本（无需 import map）

执行 `pnpm -C packages/awesome-comment build:esm:unpkg` 会生成适合 unpkg 的 ESM 构建，产物在 `packages/awesome-comment/dist/esm-unpkg`。
该版本会将第三方库拆分为多个 `vendor-*.js`，主文件会自动用相对路径引用，发布到 unpkg 后浏览器会自动拉取，无需 import map。

示例（仅供参考，版本请按需替换）：

```html
<script type="module">
  import AwesomeComment from 'https://unpkg.com/@roudanio/awesome-comment@<版本>/dist/esm-unpkg/awesome-comment.js';

  AwesomeComment.init('#comments', {
    apiUrl: 'https://your-api.example.com',
    postId: 'post-1',
    domain: 'your-auth0-domain',
    clientId: 'your-auth0-client-id',
  });
</script>
```
