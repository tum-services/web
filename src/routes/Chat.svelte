<script lang="ts">
	import { Card, Label, Textarea } from 'flowbite-svelte';
	import { LoremIpsum } from 'lorem-ipsum';
	import {
		GiftBoxSolid,
		ArrowUpRightFromSquareOutline,
		UserSolid,
		HeadphonesSolid
	} from 'flowbite-svelte-icons';
	import type { Message } from '$lib/MessageBox.svelte';
	import MessageBox from '$lib/MessageBox.svelte';

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

	let messages: Message[] = [
		{
			author: 'user',
			message: lorem.generateSentences(1)
		},
		{
			author: 'bot',
			message: lorem.generateSentences(3)
		},
		{
			author: 'user',
			message: lorem.generateSentences(5)
		},
		{
			author: 'bot',
			message: lorem.generateSentences(12)
		}
	];

	const onKeyPress = (event: KeyboardEvent) => {
		const target = event.target as HTMLTextAreaElement;

		if (event.key === 'Enter' && !event.shiftKey) {
			if (target.value.trim() !== '') {
				messages = [
					...messages,
					{
						author: 'user',
						message: target.value
					}
				];
			}
			target.value = '';
			event.preventDefault();
		}
	};
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-col-reverse w-full gap-3 overflow-scroll h-[80vh]">
		{#each messages.slice().reverse() as message}
			<MessageBox {message} />
		{/each}
	</div>

	<Label for="textarea-id" class="mb-2">Your message</Label>
	<Textarea id="textarea-id" on:keypress={onKeyPress} placeholder="Type your message here..." />
</div>
