<script lang="ts">
	import { Alert, Card, Heading, P } from 'flowbite-svelte';

	export let onSubmit: (message: string) => void;

	let exampleQuestions = [
		{
			question: 'Wie bewerbe ich mich für einen Informatikbachelor an der TUM Schritt für Schritt?',
			highlightWords: 4
		},
		{
			question: 'Was gibt es morgen in der Mensa zu essen?',
			highlightWords: 7
		},
		{
			question: 'Wo ist das Büro der Studienberatung Informatik?',
			highlightWords: 6
		},
		{
			question: 'Ich möchte eine Beurlaubung beantragen. Wie geht das?',
			highlightWords: 5
		}
	];
</script>

<div class="grid grid-cols-2 gap-3 overflow-hidden">
	{#each exampleQuestions as question}
		<Card
			class="cursor-pointer max-w-none"
			on:click={() => {
				onSubmit(question.question);
			}}
		>
			<Heading tag="h5" class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
				{question.question.split(' ').slice(0, question.highlightWords).join(' ')}
			</Heading>
			<P class="font-normal text-gray-700 dark:text-gray-400 leading-tight">
				{question.question.split(' ').slice(question.highlightWords).join(' ')}
			</P>
		</Card>
	{/each}
</div>
<Alert color="blue" class="flex-1">
	<p class="text-center">
		Hi, I'm an excellent Bot. I can help you with your questions about the Technical University of
		Munich.
	</p>
</Alert>
