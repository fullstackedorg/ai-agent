import { core_fetch2 } from "fetch";
import { Provider, ProviderInfo } from "./interface";
import openai from "openai";
import { ChatDeepSeek } from "@langchain/deepseek";

export const DeepSeekInfo: ProviderInfo = {
    id: "deepseek",
    title: "DeepSeek",
    configs: [
        {
            id: "apiKey",
            title: "API Key",
            type: "string",
            value: "",
        },
    ],
};

async function models(apiKey: string) {
    const client = new openai({
        apiKey,
        fetch: core_fetch2,
        dangerouslyAllowBrowser: true,
    });

    const models = await client.models.list();
    return models.data.map(({ id }) => id);
}

export function createDeepSeek(opts?: typeof DeepSeekInfo.configs): Provider {
    const apiKey =
        (opts?.find(({ id }) => id === "apiKey")?.value as string) || "";

    return {
        models: () => models(apiKey),
        client: (model) =>
            new ChatDeepSeek({
                model,
                apiKey,
                configuration: {
                    fetch: core_fetch2,
                },
            }),
    };
}
