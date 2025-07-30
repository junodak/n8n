import { defineStore } from 'pinia';
import { ref } from 'vue';

export const DEFAULT_CHAT_WIDTH = 400;
export const MIN_CHAT_WIDTH = 300;
export const MAX_CHAT_WIDTH = 600;

export const useChatStore = defineStore('CHAT', () => {
	// State
	const isChatOpen = ref(false);
	const chatWidth = ref(DEFAULT_CHAT_WIDTH);

	// 초기화 함수
	function initialize() {
		// 기본값 확인 및 설정
		if (chatWidth.value !== DEFAULT_CHAT_WIDTH) {
			chatWidth.value = DEFAULT_CHAT_WIDTH;
		}
	}

	// Chat UI Management
	function openChat(): void {
		isChatOpen.value = true;
	}

	function closeChat(): void {
		isChatOpen.value = false;
	}

	function toggleChat(): void {
		if (isChatOpen.value) {
			closeChat();
		} else {
			openChat();
		}
	}

	function setChatWidth(width: number): void {
		chatWidth.value = Math.min(Math.max(width, MIN_CHAT_WIDTH), MAX_CHAT_WIDTH);
	}

	// 초기화 실행
	initialize();

	return {
		// State
		isChatOpen,
		chatWidth,

		// Chat UI Management
		openChat,
		closeChat,
		toggleChat,
		setChatWidth,
		initialize,
	};
});