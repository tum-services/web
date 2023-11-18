<script lang="ts" context="module">
	export interface SourceDocument {
		source: string;
		title: string;
	}

	export interface BotMetadata {
		sources: SourceDocument[];
	}

	export interface MessageContent {
		content: string;
		botMetadata?: BotMetadata;
	}

	export interface Message {
		author: 'bot' | 'user';
		content: Promise<MessageContent>;
		partialMessageChannel?: PartialMessageListener;
	}

	export class PartialMessageListener {
		listeners: ((message: string) => void)[] = [];

		constructor() {}

		onMessage(listener: (message: string) => void) {
			this.listeners.push(listener);
		}

		send(message: string) {
			this.listeners.forEach((listener) => listener(message));
		}
	}
</script>

<script lang="ts">
	import { Card, Heading, P, Span, Spinner } from 'flowbite-svelte';
	import { ArrowUpRightFromSquareOutline, HeadphonesSolid, UserSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import Header from './Header.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import MessageBoxContent from './MessageBoxContent.svelte';

	export let message: Message;

	let partialMessage = '';

	$: {
		if (message.partialMessageChannel) {
			message.partialMessageChannel.onMessage((message) => {
				partialMessage = message;
			});
		}
	}
</script>

<Card class="w-full max-w-[100%]">
	<div class="flex flex-row gap-3 font-bold items-ceter justify-start">
		{#if message.author === 'user'}
			<UserSolid class="w-4 h-4 mt-1 text-gray-500 dark:text-gray-400" /> You
		{:else}
			<HeadphonesSolid class="w-4 h-4 mt-1 text-gray-500 dark:text-gray-400" /> TUM.services bot
		{/if}
	</div>
	<P>
		{#await message.content}
			<div class="flex flex-row gap-2 items-end">
				<MessageBoxContent typing={true} text={partialMessage} />
			</div>
		{:then content}
			<div class="flex flex-col w-full gap-3">
				<MessageBoxContent text={content.content} />

				{#if content.botMetadata && content.botMetadata.sources.length > 0}
					<div class="text-gray-500 dark:text-gray-400 font-bold mb-[-0.5rem]">
						Diese Links könnten auch noch hilfreich sein:
					</div>
					{#each content.botMetadata.sources as source}
						<a
							href={source.source}
							class="flex flex-row gap-3 items-ceter justify-start text-gray-500 dark:text-gray-400"
							target="_blank"
							rel="noopener noreferrer"
						>
							<ArrowUpRightFromSquareOutline class="w-4 h-4 mt-1" />
							<div>{source.title}</div>
						</a>
					{/each}
				{/if}
			</div>
		{:catch error}
			{error}
		{/await}
	</P>
</Card>
