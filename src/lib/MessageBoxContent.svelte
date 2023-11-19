<script lang="ts">
	import { Spinner } from 'flowbite-svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let text: string;
	export let typing: boolean = false;
</script>

<div class="message-box-contents {typing && 'typing'}">
	{#if text.length === 0}
		<p></p>
	{:else}
		<SvelteMarkdown options={{ mangle: false }} source={text} />
	{/if}
</div>

<style>
</style>
