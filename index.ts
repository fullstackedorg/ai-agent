import { createConversation } from "./src/conversation";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import { createOllama } from "./src/providers/ollama";

document.title = "FullStacked AI Agent";

const provider = createOllama();
const models = await provider.models();

const select = document.createElement("select");
models.forEach((m) => {
    const option = document.createElement("option");
    option.value = m;
    option.innerText = m;
    select.append(option);
});
document.body.append(select);

const button = document.createElement("button");
button.innerText = "New Chat";
document.body.append(button);

function createChat() {
    const container = document.createElement("div");

    const tools = [
        {
            tool: tool(
                async ({ path }) => {
                    return fs.readFile(path, { encoding: "utf8" });
                },
                {
                    name: "ReadFile",
                    description: "Get the content of the file at path.",
                    schema: z.object({
                        path: z.string(),
                    }),
                },
            ),
            message: ({ path }) => `Reading ${path}`,
        },
        {
            tool: tool(
                async ({ path, content }) => {
                    return fs.writeFile(path, content);
                },
                {
                    name: "WriteFile",
                    description: "Write the content to the file at path.",
                    schema: z.object({
                        path: z.string(),
                        content: z.string(),
                    }),
                },
            ),
            message: ({ path, content }) => `Writing ${content.length} chars to ${path}`,

        },
    ];

    const conversation = createConversation({
        chatModel: provider.client(select.value),
        tools,
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    container.append(deleteBtn);

    deleteBtn.onclick = () => container.remove();

    container.append(deleteBtn, conversation);

    document.body.append(container);
}

button.onclick = createChat;
