<script lang="ts">
	import { Button, Card, Heading, Mark, P } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import {
		EnvelopeSolid,
		ArrowRightOutline,
		CheckCircleSolid,
		CloseCircleSolid
	} from 'flowbite-svelte-icons';
	import MessageBox, { type Message } from '$lib/MessageBox.svelte';
	import { onMount } from 'svelte';

	$: activeUrl = $page.url.pathname;

	interface Chat {
		id: string;
		title: string;
		summary: string;
		wizard: Message[];
	}

	let chats: Chat[] = [];

	let current: number = 0;

	const HOST = 'https://api.tum.services';

	function convertStupidFormatInHumanReadableFormat(
		stupidFormat: { question: string; answer: string }[]
	) {
		let messages = [];
		for (let i = 0; i < stupidFormat.length; i++) {
			let current = stupidFormat[i];
			messages.push({
				author: 'bot',
				content: current.question,
				complete: true
			});
			messages.push({
				author: 'user',
				content: current.answer,
				complete: true
			});
		}
		return messages;
	}

	function crawlMessages() {
		chats = [];
		current = 0;
		fetch(`${HOST}/conversation/`)
			.then((response) => response.json())
			.then((data) => {
				for (let i = 0; i < data.length; i++) {
					if (data[i].wizard) {
						data[i].wizard = convertStupidFormatInHumanReadableFormat(data[i].wizard);
						console.log(data[i].wizard);
					}
				}
				chats = data;
				current = 0;
			})
			.catch((error) => console.error(error));
	}

	async function deleteCurrentChat() {
		let res = await fetch(`${HOST}/conversation/${chats[current].id}`, {
			method: 'DELETE'
		});

		if (res.status === 200) {
			crawlMessages();
		}
	}

	onMount(crawlMessages);
</script>

<div class="overflow-scroll h-full">
	<Heading tag="h2" class="ml-4 mt-4">Admin-Dashboard</Heading>

	<div class="flex m-4 b-4 gap-4">
		<Sidebar asideClass="min-w-[150px]" {activeUrl}>
			<SidebarWrapper>
				<SidebarGroup>
					{#each chats as chat, i}
						<SidebarItem
							label={chat.title}
							on:click={() => {
								current = i;
							}}
						></SidebarItem>
					{/each}
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
		<div class="flex flex-col w-full">
			<div class="grid grid-cols-1 gap-2">
				<div class="flex gap-4 justify-between">
					<Card class="max-w-none">
						<Heading class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
							>{chats[current]?.title}
						</Heading>
						<P class="font-normal text-gray-700 dark:text-gray-400 leading-tight"
							>{chats[current]?.summary}</P
						>
					</Card>
					<div class="grid grid-cols-2 gap-4 min-w-[400px]">
						<Button size="md" color="green" on:click={deleteCurrentChat}>
							<CheckCircleSolid class="w-3.5 h-3.5 mr-2" />
							Accept
						</Button>
						<Button size="md">
							E-Mail
							<EnvelopeSolid class="w-3.5 h-3.5 ml-2" />
						</Button>
						<Button size="md" color="red" on:click={deleteCurrentChat}>
							<CloseCircleSolid class="w-3.5 h-3.5 mr-2" />
							Decline
						</Button>
						<Button>
							send Message
							<ArrowRightOutline class="w-3.5 h-3.5 ml-2" />
						</Button>
					</div>
				</div>
				<hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
				{#if chats[current]?.wizard}
					{#each chats[current].wizard as message}
						<MessageBox {message} />
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
