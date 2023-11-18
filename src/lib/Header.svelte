<script>
    import {Button, DarkMode, Heading, Mark, Secondary} from 'flowbite-svelte';
    import {BarsOutline} from "flowbite-svelte-icons";
    export let sidebarHidden;
</script>

<nav class="flex justify-between p-8 w-full bg-slate-200 dark:bg-slate-900">

    <div class="mr-4 md:hidden">
        <Button outline={true}
                on:click={() => {
				sidebarHidden = false;
			}}><BarsOutline/></Button
        >

    </div>

	<Heading tag="h1"
		><Mark>TUM</Mark>.services <Secondary class="ml-2 text-sm"
			>where Information Finds You!</Secondary
		></Heading
	>
	<DarkMode />
</nav>
