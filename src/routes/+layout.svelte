<script>
    import {CloseButton, Drawer} from 'flowbite-svelte';
	import Header from '$lib/Header.svelte';
	import '../app.postcss';
    import {sineIn} from "svelte/easing";
    import ChatSidebar from "./ChatSidebar.svelte";

    let sidebarHidden = true;


    let transitionParams = {
        x: -320,
        duration: 200,
        easing: sineIn
    };
</script>

<div
	class="h-[100vh] w-[100vw] overflow-hidden flex flex-col justify-items-stretch items-stretch justify-stretch"
>
	<Header bind:sidebarHidden={sidebarHidden} />
	<div class="relative h-full max-h-full w-full p-[1rem] flex-1 overflow-hidden">
		<slot sidebarHidden={sidebarHidden} />
	</div>
</div>


<Drawer {transitionParams} transitionType="fly" bind:hidden={sidebarHidden}>
    <div class="flex items-center">
        <CloseButton on:click={() => (sidebarHidden = true)} class="mb-4 dark:text-white lg:hidden"/>
    </div>
    <ChatSidebar/>
</Drawer>
