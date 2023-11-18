<script lang="ts" context="module">
    export interface LogEntry {
        // ID of the sub-run.
        id: string;
        // Name of the object being run.
        name: string;
        // Type of the object being run, eg. prompt, chain, llm, etc.
        type: string;
        // List of tags for the run.
        tags: string[];
        // Key-value pairs of metadata for the run.
        metadata: { [key: string]: unknown };
        // ISO-8601 timestamp of when the run started.
        start_time: string;
        // List of LLM tokens streamed by this run, if applicable.
        streamed_output_str: string[];
        // Final output of this run.
        // Only available after the run has finished successfully.
        final_output?: unknown;
        // ISO-8601 timestamp of when the run ended.
        // Only available after the run has finished.
        end_time?: string;
    }

    export interface RunState {
        // ID of the run.
        id: string;
        // List of output chunks streamed by Runnable.stream()
        streamed_output: string[];
        // Final output of the run, usually the result of aggregating (`+`) streamed_output.
        // Only available after the run has finished successfully.
        final_output?: {
            output: string;
        };

        // Map of run names to sub-runs. If filters were supplied, this list will
        // contain only the runs that matched the filters.
        logs: { [name: string]: LogEntry };
    }

    export interface RetrieverLogEntry extends LogEntry {
        final_output: {
            documents: {
                metadata: DocumentMetadata;
            }[];
        };
    }

    export interface DocumentMetadata {
        description: string;
        source: string;
        title: string;
    }
</script>

<script lang="ts">
    import {Alert, Button, Card, Label, Textarea, ToolbarButton} from 'flowbite-svelte';
    import {LoremIpsum} from 'lorem-ipsum';
    import type {BotMetadata, Message, MessageContent} from '$lib/MessageBox.svelte';
    import MessageBox, {PartialMessageListener} from '$lib/MessageBox.svelte';
    import {fetchEventSource} from '@microsoft/fetch-event-source';
    import {applyPatch, type Operation} from 'fast-json-patch';

    const lorem = new LoremIpsum({
        sentencesPerParagraph: {
            max: 8,
            min: 4
        },
        wordsPerSentence: {
            max: 16,
            min: 4
        }
    });
    import {
        GiftBoxSolid,
        ArrowUpRightFromSquareOutline,
        UserSolid,
        HeadphonesSolid, PapperPlaneOutline, ImageOutline, FaceGrinOutline
    } from 'flowbite-svelte-icons';

    let messages: Message[] = [
        {
            author: 'user',
            content: Promise.resolve({content: lorem.generateSentences(1)})
        },
        {
            author: 'bot',
            content: Promise.resolve({
                content: lorem.generateSentences(3),
                botMetadata: {sources: [{title: 'Link', source: 'https://cit.tum.de'}]}
            })
        },
        {
            author: 'user',
            content: Promise.resolve({content: lorem.generateSentences(5)})
        },
        {
            author: 'bot',
            content: Promise.resolve({content: lorem.generateSentences(12)})
        }
    ];

    const onKeyPress = (event: KeyboardEvent) => {
        const target = event.target as HTMLTextAreaElement;

        if (event.key === 'Enter' && !event.shiftKey) {
            checkSendMessage(textAreaMessage);
            target.value = '';
            event.preventDefault();
        }
    };

    let textAreaMessage = '';

    const submitUserMessage = () => {
        checkSendMessage(textAreaMessage);
        textAreaMessage = '';
    };

    const checkSendMessage = (message: string) => {
       message = message.trim()
     if (message !== '') {
          sendMessage(message);
     }
    };



    const pushMessage = (message: Message) => {
        messages = [...messages, message];
    };

    function reducer(state: RunState | null, action: Operation[]) {
        return applyPatch(state, action, true, false).newDocument;
    }

    const sendMessage = async (message: string) => {
        pushMessage({
            author: 'user',
            content: Promise.resolve({content: message})
        });

        let partialMessageChannel = new PartialMessageListener();
        const content = new Promise<MessageContent>(async (resolve, reject) => {
            let innerLatest: RunState | null = null;
            await fetchEventSource('http://localhost:8080/rag-conversation/stream_log', {
                //signal: controller.signal,
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    input: {
                        chat_history: [],
                        question: message
                    }
                }),
                onmessage(msg) {
                    if (msg.event === 'data') {
                        innerLatest = reducer(innerLatest, JSON.parse(msg.data)?.ops);
                        console.log(innerLatest);

                        partialMessageChannel.send(
                                (innerLatest?.streamed_output as string[]).reduce((a, b) => a + b, '')
                        );
                    }
                },
                onclose() {
                    console.log(innerLatest?.final_output);

                    const metadata: BotMetadata = {
                        sources: []
                    };

                    if (innerLatest?.logs['Retriever']?.final_output) {
                        const documents = (innerLatest?.logs['Retriever'] as RetrieverLogEntry | undefined)
                                ?.final_output?.documents;

                        for (const document of documents || []) {
                            metadata.sources.push(document.metadata);
                        }
                    }

                    resolve({
                        content: (innerLatest?.final_output?.output as string) || '',
                        botMetadata: metadata
                    });
                },
                onerror(error) {
                    reject('Error: ' + error);
                    throw error;
                }
            });
        });

        pushMessage({
            author: 'bot',
            partialMessageChannel,
            content
        });
    };

    const getReply = async (): Promise<string> => {
        let message = lorem.generateSentences(10);

        // push partial message to the last message
        for (let i = 0; i < message.length; i++) {
            await delay(5000 / message.length);
            if (messages.length > 0 && messages[messages.length - 1].partialMessageChannel != undefined) {
                messages[messages.length - 1].partialMessageChannel?.send(message.slice(0, i));
            }
        }

        return message;
    };

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
</script>

<div class="flex flex-col justify-end gap-3 flex-1 max-h-full p-1">
    <div class="flex flex-col-reverse w-full gap-3 overflow-scroll">
        {#each messages.slice().reverse() as message}
            <MessageBox {message}/>
        {/each}
    </div>



    <form>
        <Alert color="dark" class="px-3 py-2">
            <svelte:fragment slot="icon">
                <Textarea bind:value={textAreaMessage} id="chat" class="mx-4" rows="1" on:keypress={onKeyPress} placeholder="Your message..."/>
                <ToolbarButton type="submit" color="blue" on:click={submitUserMessage}
                               class="rounded-full text-primary-600 dark:text-primary-500">
                    <PapperPlaneOutline class="w-5 h-5 rotate-45"/>
                    <span class="sr-only">Type your question about TUM here</span>
                </ToolbarButton>
            </svelte:fragment>
        </Alert>
    </form>


</div>
