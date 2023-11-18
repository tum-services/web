<script lang="ts" context="module">
	export interface SourceDocument {
		source: string;
		title: string;
	}

	export interface BotMetadata {
		sources: SourceDocument[];
		roomId?: string;
		wizzard?: number;
	}

	export interface Message {
		author: 'bot' | 'user' | 'system';
		content: string;
		complete: boolean;
		botMetadata?: BotMetadata;
	}
</script>

<script lang="ts">
	import { Button, Card, P } from 'flowbite-svelte';
	import { ArrowUpRightFromSquareOutline, HeadphonesSolid, UserSolid } from 'flowbite-svelte-icons';
	import MessageBoxContent from './MessageBoxContent.svelte';
	import { wizzardName } from './wizzard';

	export let message: Message;
	export let onWizzardStart: (wizzard: number) => void;
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
		{#if !message.complete}
			<div class="flex flex-row gap-2 items-end">
				<MessageBoxContent typing={true} text={message.content} />
			</div>
		{:else}
			<div class="flex flex-col w-full gap-3">
				<MessageBoxContent text={message.content} />

				{#if message.botMetadata && message.botMetadata.sources.length > 0}
					<div class="text-gray-500 dark:text-gray-400 font-bold mb-[-0.5rem]">
						Diese Links könnten auch noch hilfreich sein:
					</div>
					{#each message.botMetadata.sources as source}
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

				{#if message.botMetadata?.roomId}
					<div class="text-gray-500 dark:text-gray-400 font-bold mb-[-0.5rem]">
						Dieser Raum könnte auch noch hilfreich sein:
					</div>
					<a
						href={`https://nav.tum.de/room/${message.botMetadata.roomId}`}
						class="flex flex-row gap-3 items-ceter justify-start text-gray-500 dark:text-gray-400"
						target="_blank"
						rel="noopener noreferrer"
					>
						<img
							src={`https://nav.tum.de/api/preview/${message.botMetadata.roomId}?lang=de`}
							class="max-h-[200px]"
							alt="Room preview"
						/>
					</a>
				{/if}

				{#if message.botMetadata?.wizzard !== undefined}
					<div class="w-ful border-t border-gray-200 dark:border-gray-700"></div>

					<div class="flex flex-row gap-2 items-center">
						Möchtest die Beantragung einer {wizzardName[message.botMetadata?.wizzard ?? -1]} starten?
						<Button
							on:click={() => {
								onWizzardStart(message.botMetadata?.wizzard ?? -1);
							}}>Start!</Button
						>
					</div>
				{/if}
			</div>
		{/if}
	</P>
</Card>
