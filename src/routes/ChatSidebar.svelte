<script lang="ts">
	import { Alert, P, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { ChartPieSolid } from 'flowbite-svelte-icons';

	let clazz = '';
	export { clazz as class };
</script>

<Sidebar>
	<SidebarWrapper>
		<SidebarGroup>
			{#each [1, 2, 3, 4, 5] as i}
				<SidebarItem label="Dashboard">
					<svelte:fragment slot="icon">
						<ChartPieSolid
							class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
			{/each}
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
