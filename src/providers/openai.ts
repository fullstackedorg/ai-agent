import { core_fetch2 } from "fetch";
import { Provider, ProviderInfo } from "./interface";
import openai from "openai";
import { ChatOpenAI } from "@langchain/openai";

export const OpenAIInfo: ProviderInfo = {
    id: "openai",
    title: "OpenAI",
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
    const openAIClient = new openai({
        apiKey,
        fetch: core_fetch2,
        dangerouslyAllowBrowser: true,
    });

    const models = await openAIClient.models.list();
    return models.data.map(({ id }) => id);
}

export function createOpenAI(opts?: typeof OpenAIInfo.configs): Provider {
    const apiKey =
        (opts?.find(({ id }) => id === "apiKey")?.value as string) || "";

    return {
        models: () => models(apiKey),
        client: (model) =>
            new ChatOpenAI({
                model,
                apiKey,
                configuration: {
                    fetch: core_fetch2,
                },
            }),
    };
}
