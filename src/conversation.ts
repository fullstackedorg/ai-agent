import {
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    ToolMessage,
} from "@langchain/core/messages";
import { createHumanInput } from "./input";
import { createMarkdownStreamRenderer } from "./markdown";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StructuredTool } from "@langchain/core/tools";
import { ToolCall } from "@langchain/core/messages/tool";

type ConversationOptions = {
    chatModel: BaseChatModel;
    messages?: BaseMessage[];
    tools?: {
        tool: StructuredTool;
        message?(args: any): string;
    }[];
};

export function createConversation(opts: ConversationOptions) {
    const chatModel = opts.tools
        ? opts.chatModel.bindTools(opts.tools.map(({ tool }) => tool))
        : opts.chatModel;

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
