import { core_fetch2 } from "fetch";
import { Provider, ProviderInfo } from "./interface";
import { ChatMistralAI } from "@langchain/mistralai";
import { HTTPClient } from "@mistralai/mistralai/lib/http";
import { Mistral } from "@mistralai/mistralai";

export const MistralInfo: ProviderInfo = {
    id: "mistral",
    title: "MistralAI",
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
    const mistralClient = new Mistral({
        apiKey: apiKey,
        httpClient: {
            request: (r) => core_fetch2(r),
        } as HTTPClient,
    });

    const models = await mistralClient.models.list();
    return models.data.map(({ id }) => id);
}

export function createOpenAI(opts?: typeof MistralInfo.configs): Provider {
    const apiKey =
        (opts?.find(({ id }) => id === "apiKey")?.value as string) || "";

    return {
        models: () => models(apiKey),
        client: (model) =>
            new ChatMistralAI({
                model,
                apiKey,
                httpClient: {
                    request: (r) => core_fetch2(r),
                } as HTTPClient,
            }),
    };
}
