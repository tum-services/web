<script>
	import Faq from '$lib/FAQ.svelte';
	import { Alert, P } from 'flowbite-svelte';
	import Chat from './Chat.svelte';
</script>

<div class="p-8">
	<div class="flex justify-stretch justify-items-stretch">
		<Faq />
		<Chat />
	</div>
</div>
