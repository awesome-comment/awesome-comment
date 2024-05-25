<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import type { UiModal } from '#components';
import usePromptStore from '~/store/prompt';
import type { AiPromptTemplate } from '~/types';
import { ChineseLanguageName, LanguageName } from '~/data/lang';
import { sleep } from '@antfu/utils';

type Props = {
  comment?: Comment;
  promptId: string;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'close'): void;
}
const emit = defineEmits<Emits>();

const root = ref<UiModal>();

const promptStore = usePromptStore();

const isOpen = defineModel('isOpen', Boolean);
const isLoadingTitle = ref<boolean>(false);
const isCopied = ref<boolean>(false);
const title = ref<string>('(loading title...)');
const prompt = computed<AiPromptTemplate>(() => promptStore.prompts[ props.promptId ]);
const replaced = computed<string>(() => {
  const lang = props.comment?.postId.replace(/\/$/, '').split('/').pop();
  return prompt.value?.template.replace(/%(\w+)%/ig, (match, key) => {
    switch (key) {
      case 'TITLE':
        return title.value;
      case 'LANG_LOCAL':
        return ChineseLanguageName[ lang ?? '' ] ?? '';
      case 'LANG_EN':
        return LanguageName[ lang ?? '' ] ?? '';
      case 'USERNAME':
        return props.comment?.user.name || props.comment?.user.email || '';
      case 'COMMENT':
        return props.comment?.content ?? '';
      default:
        return match;
    }
  });
});

async function doCopy(): Promise<void> {
  await navigator.clipboard.writeText(replaced.value ?? '');
  isCopied.value = true;
  await sleep(1500);
  isCopied.value = false;
}

onBeforeMount(async () => {
  const needTitle = prompt.value?.template.includes('%TITLE%');
  if (!needTitle) return;

  isLoadingTitle.value = true;
  const res = await $fetch<ResponseBody<{ title: string }>>('/api/fetch-url?url=' + props.comment?.postId);
  title.value = res.data.title;
  isLoadingTitle.value = false;
})
onMounted(() => {
  root.value?.open();
});
</script>

<template>
  <ui-modal
    ref="root"
    v-model="isOpen"
    :has-button="false"
    :title="`Using prompt template: ${prompt?.title}`"
    @close="emit('close')"
  >
    <template #header>
      <span
        v-if="isLoadingTitle"
        class="loading loading-spinner ms-4"
      />
    </template>
    <blockquote class="px-4 py-2 bg-base-300 border-l-2 mb-4">
      {{ replaced }}
    </blockquote>
    <footer class="flex justify-end">
      <button
        type="button"
        class="btn btn-sm min-w-64 text-white"
        :class="isCopied ? 'btn-success' : 'btn-primary'"
        :disabled="isLoadingTitle"
        @click="doCopy"
      >
        <i
          class="bi"
          :class="isCopied ? 'bi-check-lg' : 'bi-copy'"
        />
        {{ isCopied ? 'Copied' : 'Copy to clipboard' }}
      </button>
    </footer>
  </ui-modal>
</template>
