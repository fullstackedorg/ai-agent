import { createConversation, createTool } from "./src/conversation";
import { z } from "zod";
import fs from "fs";
import { createOllama } from "./src/providers/ollama";
import { StoredMessage } from "@langchain/core/messages";
import { getProvider, providers } from "./src";
import { oneDark } from "@codemirror/theme-one-dark";

document.title = "FullStacked AI Agent";

const controls = document.createElement("div");

const provider = getProvider(providers().at(0));
const models = await provider.models();

const select = document.createElement("select");
models.forEach((m) => {
    const option = document.createElement("option");
    option.value = m;
    option.innerText = m;
    select.append(option);
});
controls.append(select);

const button = document.createElement("button");
button.innerText = "Load Chat";
controls.append(button);

const button2 = document.createElement("button");
button2.innerText = "Save Chat";
controls.append(button2);

const button3 = document.createElement("button");
button3.innerText = "Delete Chat";
controls.append(button3);

const status = document.createElement("span");
controls.append(status)

document.body.append(controls);

const chatSaveFile = "data/chat.json";
await fs.mkdir("data");

async function createChat() {
    let messages: StoredMessage[] = undefined;
    if (await fs.exists(chatSaveFile)) {
        messages = JSON.parse(
            await fs.readFile(chatSaveFile, { encoding: "utf8" }),
        );
    }

    const conversation = createConversation({
        model: select.value,
        messages,
        provider,
        codemirrorViewExtension: [oneDark],
        onStateChange: (state) => status.innerText = state,
        tools: [
            createTool({
                name: "ReadFile",
                description: "Get the content of the file at path.",
                schema: z.object({
                    path: z.string(),
                }),
                fn: async ({ path }) => {
                    return fs.readFile(path, { encoding: "utf8" });
                },
                message: ({ path }) => `Reading ${path}`,
            }),
            createTool({
                name: "WriteFile",
                description: "Write the content to the file at path.",
                schema: z.object({
                    path: z.string(),
                    content: z.string(),
                }),
                fn: async ({ path, content }) => {
                    return fs.writeFile(path, content);
                },
                message: ({ path, content }) =>
                    `Writing ${content.length} chars to ${path}`,
            }),
        ],
    });

    document.body.append(conversation.element);

    button2.onclick = () => {
        const chatData = JSON.stringify(conversation.serialize());
        fs.writeFile(chatSaveFile, chatData);
    };

    button3.onclick = () => {
        fs.unlink(chatSaveFile);
        conversation.element.remove();
    };
}

button.onclick = createChat;
