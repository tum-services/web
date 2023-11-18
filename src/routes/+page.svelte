<script>
	import Faq from '$lib/FAQ.svelte';
	import { Button, Drawer } from 'flowbite-svelte';
	import Chat from './Chat.svelte';
	import ChatSidebar from './ChatSidebar.svelte';
	import { sineIn } from 'svelte/easing';

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};

	let sidebarHidden = false;
</script>

<div class="flex flex-row h-full w-full overflow-hidden">
	<div class="hidden md:block">
		<ChatSidebar />
	</div>

	<div class="md:hidden">
		<Button
			on:click={() => {
				sidebarHidden = false;
			}}>Open Menu</Button
		>
	</div>

	<Drawer {transitionParams} transitionType="fly" bind:hidden={sidebarHidden}>
		<ChatSidebar />
	</Drawer>

	<div class="container h-full w-full overflow-hidden mx-auto max-h-full flex flex-col-reverse">
		<Chat />
	</div>
</div>
