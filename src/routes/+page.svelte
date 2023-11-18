<script>
	import Faq from '$lib/FAQ.svelte';
	import { Alert, P } from 'flowbite-svelte';
	import Chat from './Chat.svelte';
</script>

<div class="p-8">
	<P class="mb-4"
		>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quia quibusdam aliquid in vitae velit
		tempora harum illum itaque! Assumenda dolorem ratione explicabo optio blanditiis sit, ex
		exercitationem voluptates deleniti sequi?</P
	>
	<div class="grid grid-cols-2 gap-4">
		<Faq />
		<Chat />
	</div>
</div>
