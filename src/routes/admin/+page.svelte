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


    let chats = [
        {
            "name": "Tom",
            "concern": "Beurlaubung",
            "summary": "Thomas Florian möchte sich beurlauben lassen, da er eine Reise nach Italien plant.",
            "wizard": [
                {author: "user", content: "ich möchte mich beeurlauben lassen", complete: true},
                {author: "bot", content: "Toll du faule Sau. Welches Semester?", complete: true},
                {author: "user", content: "4. Semester", complete: true},
                {author: "bot", content: "Für ein Praktikum oder Auslandssemester?", complete: true},
                {author: "user", content: "Urlaub", complete: true},

            ]
        },
        {"name": "Tum", "summary": "Bla Bla Bla", "wizard": ["Test TUM", "Hallo ER"]},
        {"name": "Tim", "summary": "Bla Bla Bla", "wizard": ["Tiim", "Hallo ER"]},
        {"name": "Dooooorian", "summary": "Bla Bla Bla", "wizard": ["Doooorian", "Hallo ER"]},
    ]


    let current = {}

    const HOST = "https://api.tum.services"

    function crawlMessages() {


        fetch(`${HOST}/conversation/`)
                .then((response) => response.json())
                .then((data) => {
                    chats = data
                    current = data[0]
                })
                .catch((error) => console.error(error));
    }

    onMount(crawlMessages)


</script>

<div class="overflow-scroll h-full">
    <Heading tag="h2" class="ml-4 mt-4">
        <Mark>Admin-Dashboard</Mark>
    </Heading>

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
            </div>


        </div>
    </div>

</div>