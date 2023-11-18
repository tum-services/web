<script>
	import Footer from '$lib/Footer.svelte';
	import Header from '$lib/Header.svelte';
	import '../app.postcss';
</script>

<Header />

<div class="h-[100vh] w-[100vw] overflow-hidden pt-[7rem] pb-[1rem]">
	<slot />
</div>
