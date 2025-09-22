import { BaseChatModel } from "@langchain/core/language_models/chat_models";

type ConfigType =
    | {
          type: "string";
          value: string;
      }
    | {
          type: "key-value";
          value: Record<string, string>;
      };

export type ProviderInfo = {
    id: string;
    title: string;
    configs: (ConfigType & {
        id: string;
        title: string;
    })[];
};

export interface Provider {
    models(): Promise<string[]>;
    client(model: string): BaseChatModel;
}
