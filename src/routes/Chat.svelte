<script lang="ts">
	let messages: {
		author: 'bot' | 'user';
		message: string;
	}[] = [
		{
			author: 'user',
			message: 'Hello'
		},
		{
			author: 'bot',
			message: 'Hi, how are you?'
		},
		{
			author: 'user',
			message: "I'm fine, thanks"
		},
		{
			author: 'bot',
			message: 'Good to hear that'
		}
	];
</script>

<div class="flex flex-col">
	{#each messages as message}
		{#if message.author === 'bot'}
			<div class="flex flex-row justify-start">
				<div class="flex">
					{message.message}
				</div>
			</div>
		{:else}
			<div class="flex flex-row justify-end">
				<div class="flex">
					{message.message}
				</div>
			</div>
		{/if}
	{/each}
</div>

<div class="flex flex-row justify-center">
	<div class="flex">
		<input type="text" placeholder="Type your message here..." />
	</div>
</div>
