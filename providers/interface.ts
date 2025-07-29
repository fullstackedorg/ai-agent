import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface Provider {
    models(): Promise<string[]>;
    client(model: string): BaseChatModel;
}
