<script setup lang="ts">
import uniq from 'lodash-es/uniq';
import type { ResponseBody } from '@awesome-comment/core/types';
import type { AiPromptTemplate } from '~/types';
import { useAuth0 } from '@auth0/auth0-vue';

type Props = {
  data: AiPromptTemplate;
};
const props = defineProps<Props>();

const auth0 = useAuth0();

const isChanged = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isExecuting = ref<boolean>(false);
const preview = ref<string>('');
const result = ref<string>('');
const replacement = ref<Record<string, string>>({});

const replaceItems = computed<string[]>(() => {
  const matches = template.value.match(/\$(\w+?)\$/g);
  return matches ? uniq(matches.map((match) => match.slice(1, -1))) : [];
});

const template = computed<string>({
  get() {
    return props.data.content || '';
  },
  set(value: string) {
    // Template is now read-only in executor, editing is done in form
  },
});

const realReplacement = computed<Record<string, string>>(() => {
  const result = { ...replacement.value };
  for (const key in result) {
    const value = result[key];
    result[key] = value
      .replace(/\$(\w+?)\$/g, (match, key) => {
        return replacement.value[key] || '';
      })
      .trim();
  }
  return result;
});

onMounted(async () => {
  // Load saved parameters
  try {
    const token = await auth0.getAccessTokenSilently();
    const { data } = await $fetch<ResponseBody<Record<string, string>>>(`/api/admin/prompt/${props.data.id}/params`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    replacement.value = data || {};
  } catch {
    // Ignore errors
  }
});

async function doPreview(): Promise<void> {
  preview.value = template.value.replace(/\$(\w+?)\$/g, (match, key) => {
    return realReplacement.value[key] || '';
  });
  isSaving.value = true;
  isChanged.value = false;

  // Save parameters
  try {
    const token = await auth0.getAccessTokenSilently();
    await $fetch(`/api/admin/prompt/${props.data.id}/params`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: replacement.value,
    });
  } catch {
    // Ignore save errors
  }

  isSaving.value = false;
}

async function doExecute(isContinue = false): Promise<void> {
  if (isExecuting.value) return;

  isExecuting.value = true;
  if (isChanged.value) {
    await doPreview();
  }
  if (!preview.value) {
    isExecuting.value = false;
    return;
  }

  if (!isContinue) {
    result.value = '';
  }

  try {
    const token = await auth0.getAccessTokenSilently();
    const response = await fetch('/api/admin/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: isContinue
          ? [
              { role: 'user', content: preview.value },
              { role: 'assistant', content: result.value },
              { role: 'user', content: '继续' },
            ]
          : [{ role: 'user', content: preview.value }],
        postId: '',
      }),
    });

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result.value += decoder.decode(value, { stream: true });
    }
  } catch (error) {
    result.value += '\n\nError: ' + ((error as Error).message || String(error));
  }

  isExecuting.value = false;
}

function onChange(): void {
  isChanged.value = true;
}

async function doCopy(content: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content);
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
</script>

<template>
  <div class="flex gap-4 items-start">
    <div
      class="w-96"
      @change="onChange"
    >
      <span
        v-if="!replaceItems.length"
        class="text-gray-500 text-sm col-span-2 text-center"
      >
        (No variables found)
      </span>
      <div
        v-for="item in replaceItems"
        :key="item"
        class="mb-2"
      >
        <label
          :for="item"
          class="label"
        >
          <span class="label-text">${{ item }}$</span>
        </label>
        <textarea
          v-if="/_txt$/i.test(item)"
          :id="item"
          v-model="replacement[item]"
          :name="item"
          class="textarea textarea-bordered w-full"
          rows="3"
        />
        <input
          v-else
          :id="item"
          v-model="replacement[item]"
          :name="item"
          class="input input-bordered w-full"
        >
      </div>
    </div>
    <div class="flex-1">
      <div class="bg-base-200 p-4 rounded-lg mb-2 max-h-48 overflow-auto">
        <pre class="whitespace-pre-wrap font-mono text-sm">{{ template }}</pre>
      </div>
      <div class="flex items-center mb-2 gap-2">
        <button
          class="btn btn-sm btn-info text-white"
          type="button"
          @click="doPreview"
        >
          <i class="bi bi-chevron-double-down" />
          Preview
        </button>
        <span
          v-if="isSaving"
          class="loading loading-spinner ms-1"
        />
        <i
          v-if="isChanged"
          class="bi bi-file-diff"
        />
        <button
          class="btn btn-sm btn-ghost ms-auto"
          type="button"
          :disabled="!preview"
          @click="doCopy(preview)"
        >
          <i class="bi bi-clipboard" />
          Copy
        </button>
      </div>
      <textarea
        v-model="preview"
        class="textarea textarea-bordered w-full mb-2"
        rows="8"
        @change="isChanged = false"
      />
      <div class="flex items-center mb-2 gap-2">
        <button
          class="btn btn-sm btn-primary text-white"
          :disabled="!preview || isExecuting"
          type="button"
          @click="doExecute()"
        >
          <span
            v-if="isExecuting"
            class="loading loading-spinner"
          />
          <i
            v-else
            class="bi bi-play-fill"
          />
          Execute
        </button>
        <button
          class="btn btn-sm btn-primary btn-outline"
          :disabled="!preview || !result || isExecuting"
          type="button"
          @click="doExecute(true)"
        >
          <span
            v-if="isExecuting"
            class="loading loading-spinner"
          />
          <i
            v-else
            class="bi bi-three-dots"
          />
          Continue
        </button>
        <button
          class="btn btn-sm btn-ghost ms-auto"
          type="button"
          :disabled="!result"
          @click="doCopy(result)"
        >
          <i class="bi bi-clipboard" />
          Copy
        </button>
      </div>
      <textarea
        v-model="result"
        class="textarea textarea-bordered w-full"
        rows="8"
      />
    </div>
  </div>
</template>
