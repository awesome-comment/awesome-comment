<script setup lang="ts">
import type { UiModal } from '#components';
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { withCommandModifier } from '@awesome-comment/core/utils';
import { useAuth0 } from '@auth0/auth0-vue';
import { ShortcutEmojis } from '~/data';

type Props = {
  comment: Comment;
  reply?: string;
  target?: Comment;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply', reply: Comment): void;
  (event: 'save', content: string): void;
  (event: 'open'): void;
  (event: 'close'): void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const hasAiHelper = true; // AI Helper 现在始终可用（已迁移到本地）
const modal = ref<UiModal>();
const textarea = ref<HTMLTextAreaElement>();

const hasModal = ref<boolean>(false);
const isReplying = ref<boolean>(false);
const message = ref<string>('');
const reply = ref<string>(props.reply || '');

async function doOpenModal(): Promise<void> {
  hasModal.value = true;
  await nextTick();
  emit('open');
}
async function doReply(event?: Event): Promise<void> {
  if (event
    && (isReplying.value || (event.target as HTMLFormElement).matches(':invalid'))
  ) return;

  isReplying.value = true;
  message.value = '';
  const content = reply.value.trim();
  if (!content) return;

  try {
    const accessToken = await auth0.getAccessTokenSilently();
    const method = props.reply ? 'PATCH' : 'POST';
    const url = props.reply ? '/api/admin/comment/' + props.target.id : '/api/comment';
    const body = props.reply ? { content } : {
      comment: content,
      postId: props.comment.postId,
      ancestorId: props.comment.ancestorId || props.comment.id,
      parentId: props.comment.id,
      status: props.comment.status,
    };
    const { data } = await $fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    });
    if (props.reply) {
      emit('save', content);
    } else {
      emit('reply', {
        id: data.id,
        content: content,
        postId: props.comment.postId,
        parentId: props.comment.id,
        ancestorId: props.comment.ancestorId || props.comment.id,
        status: CommentStatus.Approved,
        createdAt: new Date(),
        user: {
          email: auth0.user.value?.email,
          name: auth0.user.value?.name,
        },
      } as Comment);
      reply.value = '';
    }
    modal.value.close();
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }
  isReplying.value = false;
}
async function doInsertEmoji(emoji: string): Promise<void> {
  // insert emoji at cursor position
  if (!textarea.value) return;

  textarea.value.focus();
  const { selectionStart, selectionEnd } = textarea.value;
  const text = reply.value;
  const before = text.substring(0, selectionStart);
  const after = text.substring(selectionEnd);
  reply.value = before + emoji + after;
  await nextTick();
  textarea.value.selectionStart = textarea.value.selectionEnd = selectionStart + emoji.length;
}
async function doInsertLink(): Promise<void> {
  // insert emoji at cursor position
  if (!textarea.value) return;

  const url = prompt('Please enter the link:', 'https://');
  if (!url) return;

  let title = '';
  try {
    // validate input url
    new URL(url);
    const accessToken = await auth0.getAccessTokenSilently();
    const res = await $fetch<ResponseBody<{ title: string }>>('/api/fetch-url', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        url,
      },
    });
    title = res.data.title;
  } catch (e) {
    console.error(e);
    alert('Failed to fetch the title of the URL.');
    return;
  }

  title = prompt('Please enter the title:', title) as string;

  textarea.value.focus();
  const { selectionStart, selectionEnd } = textarea.value;
  const selected = reply.value.substring(selectionStart, selectionEnd);
  const link = `[${selected || title || url}](${url}${title ? ` "${title}"` : ''})`;
  const text = reply.value;
  const before = text.substring(0, selectionStart);
  const after = text.substring(selectionEnd);
  reply.value = before + link + after;
  await nextTick();
  textarea.value.selectionStart = textarea.value.selectionEnd = selectionStart + link.length;
}
function doInsertUsername(): void {
  let username = props.comment.user.name || props.comment.user.email;
  username = username.split(' ')[ 0 ];
  if (username.includes('@')) {
    username = username.split('@')[ 0 ];
  }
  doInsertEmoji(`Hi ${username}, `);
}

function onClose(): void {
  hasModal.value = false;
  emit('close');
}
function onKeydown(event: KeyboardEvent): void {
  if (withCommandModifier(event, 'Enter')) {
    doReply(event);
  }
}
function onAiOutput(text: string, autoSubmit = false): void {
  reply.value = text;
  if (autoSubmit) {
    modal.value?.close();
    doReply();
  }
}
function onAiStart(): void {
  isReplying.value = true;
  modal.value?.close(true);
}

defineExpose({
  doOpenModal,
});
</script>

<template>
  <ui-modal
    ref="modal"
    :disabled="isReplying"
    :title="comment.postId"
    button-class="btn-info btn-sm sm:btn-xs text-white hover:text-white"
    modal-class="w-11/12 max-w-3xl"
    @close="onClose"
  >
    <template #button>
      <span
        v-if="isReplying"
        class="loading loading-xs loading-spinner"
      />
      <slot name="button-label">
        Reply
      </slot>
    </template>
    <form @submit.prevent="doReply">
      <blockquote class="mb-2 border-l-2 border-gray-200 bg-base-200 ps-2 py-2 max-h-64 overflow-auto rounded-r-box">
        {{ comment.content }}
      </blockquote>
      <div class="form-control mb-2">
        <div class="label">
          <label class="label-text">Your reply</label>
          <div class="label-text-alt">
            <button
              class="btn btn-xs btn-ghost text-success"
              type="button"
              @click="doInsertUsername"
            >
              [Name]
            </button>
            <button
              v-for="item in ShortcutEmojis"
              :key="item"
              class="btn btn-xs btn-ghost btn-square"
              type="button"
              @click="doInsertEmoji(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>
        <context-menu-wrapper>
          <textarea
            ref="textarea"
            v-model="reply"
            class="textarea textarea-bordered block w-full h-48 sm:h-auto"
            required="required"
            rows="16"
            @keydown="onKeydown"
          />

          <template #menu>
            <button
              class="btn btn-ghost rounded-md btn-sm btn-soft mt-4"
              type="button"
              @click="doInsertLink"
            >
              Insert link
            </button>
          </template>
        </context-menu-wrapper>
      </div>
      <div
        v-if="message"
        class="alert alert-error mb-4"
      >
        <p>{{ message }}</p>
      </div>
      <footer class="flex flex-col sm:flex-row justify-between gap-4">
        <ai-fixed-prompt-templates
          v-if="hasAiHelper"
          :comment="comment"
          :reply="reply"
          @ai="onAiOutput"
          @ai:start="onAiStart"
        />
        <button
          :disabled="isReplying"
          class="btn btn-primary btn-sm btn-block text-white sm:w-1/3 min-w-64 hover:text-white"
        >
          <span
            v-if="isReplying"
            class="loading loading-spinner"
          />Reply
        </button>
      </footer>
    </form>
  </ui-modal>
</template>
