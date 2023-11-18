<script>
	import Footer from '$lib/Footer.svelte';
	import Header from '$lib/Header.svelte';
	import '../app.postcss';
</script>

<div class="h-[100vh] w-[100vw] overflow-hidden">
	<Header />
	<slot />
	<Footer />
</div>
