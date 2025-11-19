import { BaseChatModel } from "@langchain/core/language_models/chat_models";

type ConfigType =
    | {
          type: "boolean";
          value: boolean;
      }
    | {
          type: "string";
          value: string;
      }
    | {
          type: "key-value";
          value: [string, string][];
      };

export type ProviderInfo<
    C extends Record<
        string,
        ConfigType & {
            title: string;
        }
    >
> = {
    id: string;
    title?: string;
    configs: C;
};

export interface Provider {
    models(): Promise<string[]>;
    client(model: string, forcedOpts?: any): BaseChatModel;
}
