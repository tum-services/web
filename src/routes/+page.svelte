<script>
	import Faq from '$lib/FAQ.svelte';
	import { Alert, P } from 'flowbite-svelte';
	import Chat from './Chat.svelte';
</script>

<div class="p-8">
	<div class="grid grid-cols-2 gap-4">
		<Faq />
		<Chat />
	</div>
</div>
