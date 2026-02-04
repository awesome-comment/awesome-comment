<script setup lang="ts">
useSeoMeta({
  title: 'Auth Admin API',
  description: 'Auth Admin 提供的鉴权与用户存储 API 使用说明',
});
</script>

<template>
  <main class="min-h-screen bg-gray-50 text-gray-900">
    <div class="mx-auto max-w-4xl space-y-10 px-6 py-10">
      <header class="space-y-3">
        <h1 class="text-3xl font-semibold">
          Awesome Auth Admin
        </h1>
        <p class="text-gray-600">
          这里是 Auth Admin 服务的 API 使用说明（默认前缀 <code>/api</code>）。
          所有接口均支持 CORS 预检（<code>OPTIONS</code>），业务请求使用 <code>POST</code>。
        </p>
      </header>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">
          鉴权流程
        </h2>
        <ol class="list-decimal space-y-2 pl-6 text-gray-700">
          <li>
            前端使用 Google One Tap / Google Identity Services 获取 <code>credential</code>（ID Token）。
          </li>
          <li>
            调用 <code>POST /api/google-auth</code> 换取本服务签发的 JWT（响应体 <code>data.token</code>）。
          </li>
          <li>
            后续请求在 Header 中携带 <code>Authorization: Bearer &lt;token&gt;</code>。
          </li>
          <li>
            使用 <code>POST /api/refresh-token</code> 刷新 token；使用 <code>POST /api/verify-auth</code> 检查 token 是否有效。
          </li>
        </ol>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">
          接口一览
        </h2>

        <div class="grid gap-4">
          <div class="space-y-3 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">
              <code>POST /api/google-auth</code>
            </h3>
            <p class="text-gray-700">
              使用 Google ID Token 换取服务端 JWT。
            </p>
            <p class="text-sm text-gray-600">
              请求体：<code>{ "credential": "..." }</code>
            </p>
            <pre class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100"><code>curl -X POST http://localhost:3020/api/google-auth \
  -H 'Content-Type: application/json' \
  -d '{\"credential\":\"&lt;google-id-token&gt;\"}'</code></pre>
          </div>

          <div class="space-y-3 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">
              <code>POST /api/verify-auth</code>
            </h3>
            <p class="text-gray-700">
              验证当前 token 并返回解码后的 payload。
            </p>
            <pre class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100"><code>curl -X POST http://localhost:3020/api/verify-auth \
  -H 'Authorization: Bearer &lt;token&gt;'</code></pre>
          </div>

          <div class="space-y-3 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">
              <code>POST /api/refresh-token</code>
            </h3>
            <p class="text-gray-700">
              使用当前 token 的 payload 重新签发一个新 token。
            </p>
            <pre class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100"><code>curl -X POST http://localhost:3020/api/refresh-token \
  -H 'Authorization: Bearer &lt;token&gt;'</code></pre>
          </div>

          <div class="space-y-3 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">
              <code>POST /api/store</code>
            </h3>
            <p class="text-gray-700">
              按用户维度存储一个键值对（需要鉴权）。
            </p>
            <p class="text-sm text-gray-600">
              请求体：<code>{ "key": "xxx", "value": "yyy" }</code>
            </p>
            <pre class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100"><code>curl -X POST http://localhost:3020/api/store \
  -H 'Authorization: Bearer &lt;token&gt;' \
  -H 'Content-Type: application/json' \
  -d '{\"key\":\"theme\",\"value\":\"dark\"}'</code></pre>
          </div>

          <div class="space-y-3 rounded-lg border bg-white p-5">
            <h3 class="font-semibold">
              <code>POST /api/retrieve</code>
            </h3>
            <p class="text-gray-700">
              按用户维度读取一个键对应的值（需要鉴权）。
            </p>
            <p class="text-sm text-gray-600">
              请求体：<code>{ "key": "xxx" }</code>
            </p>
            <pre class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100"><code>curl -X POST http://localhost:3020/api/retrieve \
  -H 'Authorization: Bearer &lt;token&gt;' \
  -H 'Content-Type: application/json' \
  -d '{\"key\":\"theme\"}'</code></pre>
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-xl font-semibold">
          配置说明
        </h2>
        <ul class="list-disc space-y-1 pl-6 text-gray-700">
          <li><code>GOOGLE_CLIENT_ID</code>：用于校验 Google ID Token（必填）。</li>
          <li><code>JWT_SECRET</code>：用于签发/验证 JWT（必填）。</li>
          <li><code>JWT_EXPIRATION</code>：JWT 过期时间（可选，支持秒数或 <code>10m</code>/<code>1h</code>/<code>7d</code>）。</li>
          <li><code>KEY_PREFIX</code>：cookie / storage key 的前缀（可选，默认 <code>aAuth</code>）。</li>
        </ul>
      </section>
    </div>
  </main>
</template>
