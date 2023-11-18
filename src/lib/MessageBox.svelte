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
		fullMessageText?: string;
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

	export interface NavigatumSearchResult {
		sections: {
			facet: 'rooms' | 'sites_buildings';
			entries: {
				id: string;
			}[];
		}[];
	}
</script>

<script lang="ts">
	import { Card, P } from 'flowbite-svelte';
	import { ArrowUpRightFromSquareOutline, HeadphonesSolid, UserSolid } from 'flowbite-svelte-icons';
	import MessageBoxContent from './MessageBoxContent.svelte';

	export let message: Message;

	let partialMessage = '';
	let roomId: string | undefined = undefined;
	let roomNumber: string | undefined = undefined;

	$: {
		if (message.partialMessageChannel) {
			message.partialMessageChannel.onMessage((message) => {
				partialMessage = message;
				extractRoomNumber(partialMessage);
			});
		}
	}

	const extractRoomNumber = async (message: string) => {
		if (roomId || roomNumber) return;

		let roomNumberMatch = message.match(/\d+\.\d+\.\d+/);
		console.log(roomNumberMatch);
		if (!roomNumberMatch) {
			return;
		}

		roomNumber = roomNumberMatch[0];
		let r = await fetch(`https://nav.tum.de/api/search?q=${roomNumber}`);
		let data = (await r.json()) as NavigatumSearchResult;
		if (data.sections.length === 0) {
			return;
		}

		let rooms = undefined;
		for (let section of data.sections) {
			if (section.facet === 'rooms') {
				rooms = section.entries;
				break;
			}
		}

		console.log(rooms);
		if (!rooms || rooms.length === 0) {
			return;
		}

		let room = rooms[0];
		roomId = room.id;
	};
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

				{#if roomId}
					<div class="text-gray-500 dark:text-gray-400 font-bold mb-[-0.5rem]">
						Dieser Raum könnte auch noch hilfreich sein:
					</div>
					<a
						href={`https://nav.tum.de/room/${roomId}`}
						class="flex flex-row gap-3 items-ceter justify-start text-gray-500 dark:text-gray-400"
						target="_blank"
						rel="noopener noreferrer"
					>
						<img
							src={`https://nav.tum.de/api/preview/${roomId}?lang=de`}
							class="max-h-[200px]"
							alt="Room preview"
						/>
					</a>
				{/if}
			</div>
		{:catch error}
			{error}
		{/await}
	</P>
</Card>
