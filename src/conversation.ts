import {
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    mapChatMessagesToStoredMessages,
    mapStoredMessagesToChatMessages,
    StoredMessage,
    ToolMessage,
    AIMessage,
} from "@langchain/core/messages";
import { createHumanInput } from "./input";
import { createMarkdownStreamRenderer } from "./markdown";
import { tool } from "@langchain/core/tools";
import { ToolCall } from "@langchain/core/messages/tool";
import { z } from "zod";
import { Provider } from "./providers/interface";

type ConversationOptions = {
    model: string;
    provider: Provider;
    messages?: StoredMessage[];
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

function classForMessageType(message: BaseMessage) {
    if (message instanceof HumanMessage) {
        return "human";
    } else if (
        message instanceof AIMessage ||
        message instanceof AIMessageChunk
    ) {
        return "ai";
    } else if (message instanceof ToolMessage) {
        return "tool";
    }
}

export function createConversation(opts: ConversationOptions) {
    const client = opts.provider.client(opts.model);

    const chatModel = opts.tools
        ? client.bindTools(opts.tools.map(({ tool }) => tool))
        : client;

    const element = document.createElement("div");
    element.classList.add("conversation");

    const conversation: BaseMessage[] = mapStoredMessagesToChatMessages(
        opts?.messages || [],
    );
    const messagesContainer = document.createElement("div");
    messagesContainer.classList.add("messages");

    const renderMessage = (message: BaseMessage) => {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add(classForMessageType(message));
        messagesContainer.append(messageContainer);
        const renderer = createMarkdownStreamRenderer(messageContainer);
        renderer.write(
            message.response_metadata["user-defined-message"] ||
                (message.content as string),
        );
        renderer.end();
    };

    conversation.forEach(renderMessage);

    const onToolRequest = async (toolCall: ToolCall) => {
        const t = opts.tools.find(
            ({ tool: { name } }) => name === toolCall.name,
        );

        const container = document.createElement("div");
        const userDefinedMessage =
            t.message?.(toolCall.args) || `Using tool ${toolCall.name}`;
        container.innerText = userDefinedMessage;
        messagesContainer.append(container);

        const toolResponse: ToolMessage = await t.tool.invoke(toolCall);
        toolResponse.response_metadata["user-defined-message"] =
            userDefinedMessage;
        conversation.push(toolResponse);

        return !!toolResponse.content;
    };

    const onHumanPrompt = (text: string) => {
        const humanMessage = new HumanMessage(text);
        conversation.push(humanMessage);
        renderMessage(humanMessage);
        promptAgent();
    };

    const promptAgent = async () => {
        let done = false;
        const aiMessageContainer = document.createElement("div");
        messagesContainer.append(aiMessageContainer);

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
                aiMessageContainer.classList.add(classForMessageType(chunk));
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

    element.append(messagesContainer, humanInput);

    const serialize = () => mapChatMessagesToStoredMessages(conversation);

    return {
        element,
        serialize,
    };
}
