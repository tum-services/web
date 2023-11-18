<script lang="ts" context="module">
	export interface LogEntry {
		// ID of the sub-run.
		id: string;
		// Name of the object being run.
		name: string;
		// Type of the object being run, eg. prompt, chain, llm, etc.
		type: string;
		// List of tags for the run.
		tags: string[];
		// Key-value pairs of metadata for the run.
		metadata: { [key: string]: unknown };
		// ISO-8601 timestamp of when the run started.
		start_time: string;
		// List of LLM tokens streamed by this run, if applicable.
		streamed_output_str: string[];
		// Final output of this run.
		// Only available after the run has finished successfully.
		final_output?: unknown;
		// ISO-8601 timestamp of when the run ended.
		// Only available after the run has finished.
		end_time?: string;
	}

	export interface RunState {
		// ID of the run.
		id: string;
		// List of output chunks streamed by Runnable.stream()
		streamed_output: string[];
		// Final output of the run, usually the result of aggregating (`+`) streamed_output.
		// Only available after the run has finished successfully.
		final_output?: {
			output: string;
		};

		// Map of run names to sub-runs. If filters were supplied, this list will
		// contain only the runs that matched the filters.
		logs: { [name: string]: LogEntry };
	}

	export interface RetrieverLogEntry extends LogEntry {
		final_output: {
			documents: {
				metadata: DocumentMetadata;
			}[];
		};
	}

	export interface DocumentMetadata {
		description: string;
		source: string;
		title: string;
	}
</script>

<script lang="ts">
	import { Textarea, ToolbarButton } from 'flowbite-svelte';
	import type { BotMetadata, Message } from '$lib/MessageBox.svelte';
	import MessageBox from '$lib/MessageBox.svelte';
	import { fetchEventSource } from '@microsoft/fetch-event-source';
	import { applyPatch, type Operation } from 'fast-json-patch';
	import { PapperPlaneOutline } from 'flowbite-svelte-icons';
	import StartChat from '$lib/StartChat.svelte';
	import { findRoomId } from '$lib/navigatum';

	let messages: Message[] = [];
	let textAreaMessage = '';
	let busy = false;

	const onKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			submitUserMessage();
		}
	};

	const submitUserMessage = () => {
		checkSendMessage(textAreaMessage);
		textAreaMessage = '';
	};

	const checkSendMessage = (message: string) => {
		message = message.trim();
		if (message !== '') {
			sendMessage(message);
		}
	};

	const pushMessage = (message: Message) => {
		messages = [...messages, message];
	};

	const updateLastMessage = (message: Message) => {
		messages[messages.length - 1] = message;
		messages = [...messages];
	};

	function reducer(state: RunState | null, action: Operation[]) {
		return applyPatch(state, action, true, false).newDocument;
	}

	const extractMetadata = async (state: RunState | null): Promise<BotMetadata> => {
		const metadata: BotMetadata = {
			sources: [],
			roomId: undefined
		};

		if (state?.logs['Retriever']?.final_output) {
			const documents = (state?.logs['Retriever'] as RetrieverLogEntry | undefined)?.final_output
				?.documents;

			for (const document of documents || []) {
				// check if link already exists
				const existing = metadata.sources.find(
					(source) => source.source === document.metadata.source
				);
				if (!existing) {
					metadata.sources.push(document.metadata);
				}
			}
		}

		if (state?.final_output?.output)
			metadata.roomId = await findRoomId(state?.final_output?.output);

		return metadata;
	};

	const sendMessage = async (message: string) => {
		busy = true;

		pushMessage({
			author: 'user',
			content: message,
			complete: true
		});

		pushMessage({
			author: 'bot',
			content: '',
			complete: false
		});

		let innerLatest: RunState | null = null;

		const chatHistory: [string, string][] = [];
		for (let i = 0; i + 1 < messages.length; i += 2) {
			chatHistory.push([messages[i].content, messages[i + 1].content]);
		}

		while (chatHistory.length > 5) {
			chatHistory.shift();
		}

		await fetchEventSource('https://api.tum.services/rag-conversation/stream_log', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: {
					chat_history: chatHistory,
					question: message
				}
			}),
			onmessage(msg) {
				if (msg.event === 'data') {
					innerLatest = reducer(innerLatest, JSON.parse(msg.data)?.ops);
					console.log(innerLatest);

					updateLastMessage({
						...messages[messages.length - 1],
						content: innerLatest?.streamed_output.join('') || ''
					});
				}
			},
			async onclose() {
				console.log(innerLatest?.final_output);

				let botMetadata = await extractMetadata(innerLatest);
				let content = innerLatest?.final_output?.output || '';

				updateLastMessage({
					author: 'bot',
					content,
					complete: true,
					botMetadata
				});
			},
			onerror(error) {
				updateLastMessage({
					...messages[messages.length - 1],
					content: 'Error: ' + error,
					complete: true
				});
				throw error;
			}
		});

		busy = false;
	};
</script>

<div class="flex flex-col justify-end gap-3 flex-1 max-h-full p-1">
	<div class="flex flex-col-reverse w-full gap-3 overflow-scroll">
		{#if messages.length === 0}
			<StartChat bind:textAreaMessage />
		{/if}

		{#each messages.slice().reverse() as message}
			<MessageBox {message} />
		{/each}
	</div>
	<form>
		<div class="flex gap-2">
			<Textarea
				bind:value={textAreaMessage}
				id="chat"
				rows="2"
				on:keypress={onKeyPress}
				placeholder="Your message..."
				disabled={busy}
			/>
			<ToolbarButton
				type="submit"
				color="blue"
				on:click={submitUserMessage}
				class="rounded-full text-primary-600 dark:text-primary-500"
				disabled={busy}
			>
				<PapperPlaneOutline class="w-5 h-5 rotate-45" />
				<span class="sr-only">Type your question about TUM here</span>
			</ToolbarButton>
		</div>
	</form>
</div>
