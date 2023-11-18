<script>
    import {Button, Card, Heading, Mark, P} from "flowbite-svelte";
    import {page} from '$app/stores';
    import {Sidebar, SidebarGroup, SidebarItem, SidebarWrapper} from 'flowbite-svelte';
    import {
        ChartPieSolid,
        GridSolid,
        MailBoxSolid,
        UserSolid,
        ArrowRightToBracketSolid,
        FileEditSolid, EnvelopeSolid, ArrowRightOutline, CheckCircleSolid, CloseCircleSolid
    } from 'flowbite-svelte-icons';
    import MessageBox from "$lib/MessageBox.svelte";
    import {onMount} from "svelte";

    $: activeUrl = $page.url.pathname;

    let chats = []

    let current = {}

    const HOST = "https://api.tum.services"

    function convertStupidFormatInHumanReadableFormat(stupidFormat) {
        let messages = []
        for (let i = 0; i < stupidFormat.length; i++) {
            let current = stupidFormat[i]
            messages.push({
                author: 'bot',
                content: current.question,
                complete: true
            })
            messages.push({
                author: 'user',
                content: current.answer,
                complete: true
            })
        }
        return messages
    }

    function crawlMessages() {
        fetch(`${HOST}/conversation/`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].wizard) {
                            data[i].wizard = convertStupidFormatInHumanReadableFormat(data[i].wizard)
                            console.log(data[i].wizard)
                        }
                    }
                    chats = data
                    current = data[0]
                })
                .catch((error) => console.error(error));
    }

    onMount(crawlMessages)


</script>

<div class="overflow-scroll h-full">
    <Heading tag="h2" class="ml-4 mt-4">
        Admin-Dashboard</Heading>

    <div class="flex m-4 b-4 gap-4">
        <Sidebar {activeUrl}>
            <SidebarWrapper>
                <SidebarGroup>
                    {#each chats as chat}
                        <SidebarItem label={chat.title} on:click={() => {current = chat}}>
                            <svelte:fragment slot="icon">
                                <ChartPieSolid
                                        class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"/>
                            </svelte:fragment>
                        </SidebarItem>
                    {/each}
                </SidebarGroup>
            </SidebarWrapper>
        </Sidebar>
        <div class="flex flex-col w-full">
            <div class="grid grid-cols-1 gap-2">
                <div class="flex gap-4 justify-between">
                    <Card>
                        <Heading
                                class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{current.title}
                        </Heading>
                        <P class="font-normal text-gray-700 dark:text-gray-400 leading-tight">{current.summary}</P>
                    </Card>
                    <div>
                        <div class="grid grid-cols-2 gap-4">
                            <Button size="md" color="green">
                                <CheckCircleSolid class="w-3.5 h-3.5 mr-2"/>
                                Accept
                            </Button>
                            <Button size="md">
                                E-Mail
                                <EnvelopeSolid class="w-3.5 h-3.5 ml-2"/>

                            </Button>
                            <Button size="md" color="red">
                                <CloseCircleSolid class="w-3.5 h-3.5 mr-2"/>
                                Decline
                            </Button>

                            <Button>
                                send Message
                                <ArrowRightOutline class="w-3.5 h-3.5 ml-2"/>
                            </Button>
                        </div>
                    </div>

                </div>
                <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700">
                {#if current.wizard}
                    {#each current.wizard as message }
                        <MessageBox message={message}/>
                    {/each}
                {/if}
            </div>
        </div>
    </div>

</div>