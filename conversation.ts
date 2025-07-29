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
    tools?: StructuredTool[];
};

export function createConversation(opts: ConversationOptions) {
    const chatModel = opts.tools
        ? opts.chatModel.bindTools(opts.tools)
        : opts.chatModel;

    const container = document.createElement("div");

    const conversation: BaseMessage[] = opts?.messages || [];
    const conversationContainer = document.createElement("div");

    const onToolRequest = async (toolCall: ToolCall) => {
        const container = document.createElement("div");
        container.innerText = toolCall.name;
        conversationContainer.append(container);

        console.log(toolCall);

        const tool = opts.tools.find(({ name }) => name === toolCall.name);
        const toolResponse: ToolMessage = await tool.invoke(toolCall);
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
        const aiMessageContainer = document.createElement("div");
        conversationContainer.append(aiMessageContainer);
        const renderer = createMarkdownStreamRenderer(aiMessageContainer);
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
    };

    const humanInput = createHumanInput({
        onSubmit: onHumanPrompt,
    });

    container.append(conversationContainer, humanInput);

    return container;
}
