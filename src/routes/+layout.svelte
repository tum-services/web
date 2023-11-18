<script>
	import Footer from '$lib/Footer.svelte';
	import Header from '$lib/Header.svelte';
	import '../app.postcss';
</script>

<div
	class="h-[100vh] w-[100vw] overflow-hidden flex flex-col justify-items-stretch items-stretch justify-stretch"
>
	<Header />
	<div class="relative h-full max-h-full w-full p-[1rem] flex-1 overflow-hidden">
		<slot />
	</div>
</div>
