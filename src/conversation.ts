import {
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    ToolMessage,
} from "@langchain/core/messages";
import { createHumanInput } from "./input";
import { createMarkdownStreamRenderer } from "./markdown";
import { tool } from "@langchain/core/tools";
import { ToolCall } from "@langchain/core/messages/tool";
import { z } from "zod";

type ConversationOptions = {
    model: string;
    provider: Provider;
    messages?: BaseMessage[];
    tools?: ReturnType<typeof createTool>[];
};

export function createTool<T extends z.ZodSchema>(opts: {
    name: string;
    description: string;
    schema: T;
    fn(args: z.infer<T>): any;
    message?(args: z.infer<T>): string;
}) {
    return {
        tool: tool(opts.fn, {
            name: opts.name,
            description: opts.description,
            schema: opts.schema as any,
        }),
        message: opts.message,
    };
}

export function createConversation(opts: ConversationOptions) {
    const client = opts.provider.client(opts.model);

    const chatModel = opts.tools
        ? client.bindTools(opts.tools.map(({ tool }) => tool))
        : client;

    const container = document.createElement("div");

    const conversation: BaseMessage[] = opts?.messages || [];
    const conversationContainer = document.createElement("div");

    const onToolRequest = async (toolCall: ToolCall) => {
        const t = opts.tools.find(
            ({ tool: { name } }) => name === toolCall.name,
        );

        const container = document.createElement("div");
        container.innerText = t.message?.(toolCall.args) || toolCall.name;
        conversationContainer.append(container);

        const toolResponse: ToolMessage = await t.tool.invoke(toolCall);
        conversation.push(toolResponse);

        return !!toolResponse.content;
    };

    const onHumanPrompt = (text: string) => {
        const humanMessage = new HumanMessage(text);
        humanMessage.toJSON();
        conversation.push(humanMessage);
        const humanMessageContainer = document.createElement("div");
        humanMessageContainer.innerText = humanMessage.content as string;
        conversationContainer.append(humanMessageContainer);
        promptAgent();
    };

    const promptAgent = async () => {
        let done = false;
        const aiMessageContainer = document.createElement("div");
        conversationContainer.append(aiMessageContainer);

        const responseContainer = document.createElement("div");
        const loadingContainer = document.createElement("div");
        const loadingDisplayInterval = setInterval(() => {
            if (done) {
                clearInterval(loadingDisplayInterval);
                loadingContainer.remove();
            } else {
                const dotCount = loadingContainer.innerText.length;
                loadingContainer.innerText = new Array((dotCount % 3) + 1)
                    .fill(".")
                    .join("");
            }
        }, 250);

        aiMessageContainer.append(responseContainer, loadingContainer);

        const renderer = createMarkdownStreamRenderer(responseContainer);
        const stream = await chatModel.stream(conversation);
        let messageIndex: number = null;
        for await (const chunk of stream) {
            if (messageIndex === null) {
                messageIndex = conversation.length;
                conversation.push(chunk);
            } else {
                conversation[messageIndex] = (
                    conversation[messageIndex] as AIMessageChunk
                ).concat(chunk);
            }

            if (typeof chunk.content === "string") {
                renderer.write(chunk.content);
            }
        }
        renderer.end();

        const aiMessage = conversation.at(messageIndex) as AIMessageChunk;
        const toolPromises = aiMessage.tool_calls.map((t) => onToolRequest(t));
        const awaitedToolPromises = await Promise.all(toolPromises);
        if (awaitedToolPromises.some((r) => r)) {
            promptAgent();
        }
        done = true;
    };

    const humanInput = createHumanInput({
        onSubmit: onHumanPrompt,
    });

    container.append(conversationContainer, humanInput);

    return container;
}
