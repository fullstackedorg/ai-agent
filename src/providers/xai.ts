import { core_fetch2 } from "fetch";
import { Provider, ProviderInfo } from "./interface";
import openai from "openai";
import { ChatXAI } from "@langchain/xai";

export const xAIInfo: ProviderInfo<{
    apiKey: {
        title: "API Key";
        type: "string";
        value: string;
    };
}> = {
    id: "xai",
    title: "xAI",
    configs: {
        apiKey: {
            title: "API Key",
            type: "string",
            value: ""
        }
    }
};

async function models(apiKey: string) {
    const client = new openai({
        apiKey,
        fetch: core_fetch2,
        baseURL: "https://api.x.ai/v1",
        dangerouslyAllowBrowser: true
    });

    const models = await client.models.list();
    return models.data.map(({ id }) => id);
}

export function createGrok(opts?: typeof xAIInfo.configs): Provider {
    const apiKey = opts?.apiKey?.value || "";

    return {
        models: () => models(apiKey),
        client: (model) =>
            new ChatXAI({
                model,
                apiKey
            })
    };
}
