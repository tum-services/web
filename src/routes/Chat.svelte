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
	import { Alert, Button, Card, Label, Textarea, ToolbarButton } from 'flowbite-svelte';
	import { LoremIpsum } from 'lorem-ipsum';
	import type { BotMetadata, Message, MessageContent } from '$lib/MessageBox.svelte';
	import MessageBox, { PartialMessageListener } from '$lib/MessageBox.svelte';
	import { fetchEventSource } from '@microsoft/fetch-event-source';
	import { applyPatch, type Operation } from 'fast-json-patch';
	import { PapperPlaneOutline } from 'flowbite-svelte-icons';
	import StartChat from '$lib/StartChat.svelte';

	const lorem = new LoremIpsum({
		sentencesPerParagraph: {
			max: 8,
			min: 4
		},
		wordsPerSentence: {
			max: 16,
			min: 4
		}
	});

	let messages: Message[] = [];
	let chatHistory: string[][] = [];

	const onKeyPress = (event: KeyboardEvent) => {
		const target = event.target as HTMLTextAreaElement;

		if (event.key === 'Enter' && !event.shiftKey) {
			checkSendMessage(textAreaMessage);
			target.value = '';
			event.preventDefault();
		}
	};

	let textAreaMessage = '';

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

	function reducer(state: RunState | null, action: Operation[]) {
		return applyPatch(state, action, true, false).newDocument;
	}

	const sendMessage = async (message: string) => {
		pushMessage({
			author: 'user',
			content: Promise.resolve({ content: message })
		});

		let partialMessageChannel = new PartialMessageListener();
		const content = new Promise<MessageContent>(async (resolve, reject) => {
			let innerLatest: RunState | null = null;
			await fetchEventSource('https://api.tum.services/rag-conversation/stream_log', {
				//signal: controller.signal,
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

						partialMessageChannel.send(
							(innerLatest?.streamed_output as string[]).reduce((a, b) => a + b, '')
						);
					}
				},
				onclose() {
					console.log(innerLatest?.final_output);

					const metadata: BotMetadata = {
						sources: []
					};

					if (innerLatest?.logs['Retriever']?.final_output) {
						const documents = (innerLatest?.logs['Retriever'] as RetrieverLogEntry | undefined)
							?.final_output?.documents;

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

					let reply = (innerLatest?.final_output?.output as string) || '';

					if (chatHistory.length >= 5) chatHistory.shift();

					chatHistory.push([message, reply]);

					resolve({
						content: reply,
						botMetadata: metadata
					});
				},
				onerror(error) {
					reject('Error: ' + error);
					throw error;
				}
			});
		});

		pushMessage({
			author: 'bot',
			partialMessageChannel,
			content
		});
	};

	let busy = false;
	$: busy = messages.length > 0 && messages[messages.length - 1].author === 'user';
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
