<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useChatStore } from '@/stores/chat.store';
import { useI18n } from '@n8n/i18n';

const chatStore = useChatStore();
const { t } = useI18n();

const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const messageInput = ref('');
const chatTextarea = ref<HTMLTextAreaElement | null>(null);

const sidebarStyle = computed(() => ({
	width: `${chatStore.chatWidth}px`,
}));

const isSubmitDisabled = computed(() => {
	return messageInput.value.trim() === '';
});

onMounted(() => {
	// Store 초기화 확인
	chatStore.initialize();
});

const onClose = () => {
	chatStore.closeChat();
};

const onSubmit = () => {
	// 아무 일도 하지 않음 (기본 구조만)
	console.log('Submit:', messageInput.value);
};

const onSubmitKeydown = (event: KeyboardEvent) => {
	if (event.shiftKey || event.isComposing) {
		return;
	}
	event.preventDefault();
	onSubmit();
	adjustTextAreaHeight();
};

function adjustTextAreaHeight() {
	const textarea = chatTextarea.value;
	if (!textarea) return;
	// Set to content minimum to get the right scrollHeight
	textarea.style.height = 'var(--chat--textarea--height)';
	// Get the new height, with a small buffer for padding
	const newHeight = Math.min(textarea.scrollHeight, 480); // 30rem
	textarea.style.height = `${newHeight}px`;
}

const onMouseDown = (event: MouseEvent) => {
	isResizing.value = true;
	startX.value = event.clientX;
	startWidth.value = chatStore.chatWidth;
	
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
	document.body.style.cursor = 'col-resize';
	event.preventDefault();
};

const onMouseMove = (event: MouseEvent) => {
	if (!isResizing.value) return;
	
	const deltaX = startX.value - event.clientX; // 왼쪽으로 드래그할 때 양수
	const newWidth = startWidth.value + deltaX;
	
	chatStore.setChatWidth(newWidth);
};

const onMouseUp = () => {
	isResizing.value = false;
	document.removeEventListener('mousemove', onMouseMove);
	document.removeEventListener('mouseup', onMouseUp);
	document.body.style.cursor = '';
};
</script>

<template>
	<div :class="$style.chat" :style="sidebarStyle">
		<div :class="$style.resizeHandle" @mousedown="onMouseDown"></div>
		
		<div :class="$style.chatHeader">
			<div :class="$style.chatTitle">AI Chat</div>
			<button :class="$style.newHeaderButton" @click="onClose">×</button>
		</div>
		
		<main :class="$style.chatBody">
			<div :class="$style.messages">
				<div :class="$style.emptyState">Start a conversation!</div>
			</div>
		</main>

		<div :class="$style.messagesInput">
			<div :class="$style.chatInputWrapper">
				<textarea
					ref="chatTextarea"
					v-model="messageInput"
					:class="$style.chatTextarea"
					placeholder="Type a message..."
					@keydown.enter="onSubmitKeydown"
					@input="adjustTextAreaHeight"
					@mousedown="adjustTextAreaHeight"
					@focus="adjustTextAreaHeight"
				/>
				<div :class="$style.chatInputsControls">
					<button 
						:class="$style.chatInputSendButton" 
						:disabled="isSubmitDisabled" 
						@click="onSubmit"
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" module>
/* 리사이즈 핸들 - 기존 방식 유지 */
.resizeHandle {
	position: absolute;
	width: 12px;
	height: 100%;
	top: -2px;
	left: -2px;
	cursor: ew-resize;
	background-color: transparent;
	z-index: 10;
}

/* ChatMessagesPanel 스타일 정확히 복사 */
.chat {
	--chat--spacing: var(--spacing-xs);
	--chat--message--padding: var(--spacing-2xs);
	--chat--message--font-size: var(--font-size-2xs);
	--chat--input--font-size: var(--font-size-s);
	--chat--input--placeholder--font-size: var(--font-size-xs);
	--chat--message--bot--background: transparent;
	--chat--message--user--background: var(--color-text-lighter);
	--chat--message--bot--color: var(--color-text-dark);
	--chat--message--user--color: var(--color-text-dark);
	--chat--message--bot--border: none;
	--chat--message--user--border: none;
	--chat--input--padding: var(--spacing-xs);
	--chat--color-typing: var(--color-text-light);
	--chat--textarea--max-height: calc(var(--panel-height) * 0.3);
	--chat--message--pre--background: var(--color-foreground-light);
	--chat--textarea--height: calc(
		var(--chat--input--padding) * 2 + var(--chat--input--font-size) *
			var(--chat--input--line-height)
	);
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background-color: var(--color-background-light);
	border-left: var(--border-base);
	position: relative;
}

.chatHeader {
	font-size: var(--font-size-s);
	font-weight: var(--font-weight-regular);
	line-height: 18px;
	text-align: left;
	border-bottom: 1px solid var(--color-foreground-base);
	padding: var(--chat--spacing);
	background-color: var(--color-foreground-xlight);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.chatTitle {
	font-weight: var(--font-weight-medium);
}

.newHeaderButton {
	border: none;
	color: var(--color-text-light);
	background: none;
	font-size: 20px;
	cursor: pointer;
	padding: 4px 8px;

	&:hover {
		color: var(--color-text-dark);
	}
}

.chatBody {
	display: flex;
	height: 100%;
	overflow: auto;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.messages {
	border-radius: var(--border-radius-base);
	height: 100%;
	width: 100%;
	overflow: auto;
	padding-top: var(--spacing-l);

	&:not(:last-child) {
		margin-right: 1em;
	}
}

.emptyState {
	text-align: center;
	color: var(--color-text-light);
	font-style: italic;
	margin-top: var(--spacing-l);
}

.messagesInput {
	--input-border-color: var(--border-color-base);
	--chat--input--border: none;
	--chat--input--border-radius: 0.5rem;
	--chat--input--send--button--background: transparent;
	--chat--input--send--button--color: var(--color-primary);
	--chat--input--border-active: var(--input-focus-border-color, var(--color-secondary));
	--chat--input--background: transparent;

	[data-theme='dark'] & {
		--chat--input--text-color: var(--input-font-color, var(--color-text-dark));
	}
	@media (prefers-color-scheme: dark) {
		--chat--input--text-color: var(--input-font-color, var(--color-text-dark));
	}

	padding: var(--spacing-5xs);
	margin: 0 var(--chat--spacing) var(--chat--spacing);
	flex-grow: 1;
	display: flex;
	background: var(--color-lm-chat-bot-background);
	border-radius: var(--chat--input--border-radius);
	transition: border-color 200ms ease-in-out;
	border: var(--input-border-color, var(--border-color-base))
		var(--input-border-style, var(--border-style-base))
		var(--input-border-width, var(--border-width-base));

	&:focus-within {
		--input-border-color: #4538a3;
	}
}

.chatInputWrapper {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-end;
}

.chatTextarea {
	font-family: inherit;
	font-size: var(--chat--input--font-size);
	width: 100%;
	border: var(--chat--input--border, 0);
	border-radius: var(--chat--input--border-radius);
	padding: var(--chat--input--padding);
	min-height: var(--chat--textarea--height, 2.5rem);
	max-height: var(--chat--textarea--max-height);
	height: var(--chat--textarea--height, 2.5rem);
	resize: none;
	overflow-y: auto;
	background: var(--chat--input--background, white);
	color: var(--chat--input--text-color, initial);
	outline: none;
	line-height: var(--chat--input--line-height, 1.5);

	&::placeholder {
		font-size: var(--chat--input--placeholder--font-size, var(--chat--input--font-size));
	}
	&:focus,
	&:hover {
		border-color: var(--chat--input--border-active, 0);
	}
}

.chatInputsControls {
	display: flex;
}

.chatInputSendButton {
	height: var(--chat--textarea--height);
	width: var(--chat--textarea--height);
	background: var(--chat--input--send--button--background, transparent);
	cursor: pointer;
	color: var(--chat--input--send--button--color, var(--chat--color-secondary));
	border: 0;
	font-size: 24px;
	display: inline-flex;
	align-items: center;
	justify-content: center;

	svg {
		min-width: fit-content;
	}

	&[disabled] {
		cursor: no-drop;
		color: var(--chat--color-disabled);
	}
}
</style>