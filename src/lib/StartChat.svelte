<script>
	import { Alert, Card, Heading, P } from 'flowbite-svelte';

	export let textAreaMessage = '';
</script>

<div class="grid grid-cols-2 gap-3 overflow-hidden">
	<Card
		class="cursor-pointer max-w-none"
		on:click={() => {
			textAreaMessage = 'Wie viel ETCS umfasst das Anwendungsfach?';
		}}
	>
		<Heading tag="h5" class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
			>Anwendungsfach
		</Heading>
		<P class="font-normal text-gray-700 dark:text-gray-400 leading-tight"
			>Wie viel ETCS umfasst das Anwendungsfach?</P
		>
	</Card>
	<Card
		class="cursor-pointer max-w-none"
		on:click={() => {
			textAreaMessage = 'Wie kann ich mich beurlauben lassen?';
		}}
	>
		<Heading tag="h5" class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
			>Beurlaubung
		</Heading>
		<P class="font-normal text-gray-700 dark:text-gray-400 leading-tight"
			>Wie kann ich mich beurlauben lassen?</P
		>
	</Card>
</div>
<Alert color="blue" class="flex-1">
	<p class="text-center">
		Hi, I'm an excellent Bot. I can help you with your questions about the Technical University of
		Munich.
	</p>
</Alert>
