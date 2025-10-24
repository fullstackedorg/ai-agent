import Anthropic from "@anthropic-ai/sdk";
import { ChatAnthropic } from "@langchain/anthropic";
import { ProviderInfo } from "./interface";
import { core_fetch2 } from "fetch";
import { Provider } from "@fullstacked/ai-agent/src/providers/interface";

export const AnthropicInfo: ProviderInfo<{
    apiKey: {
        title: "API Key";
        type: "string";
        value: string;
    };
}> = {
    id: "anthropic",
    title: "Anthropic",
    configs: {
        apiKey: {
            title: "API Key",
            type: "string",
            value: "",
        },
    },
};

async function models(apiKey: string) {
    const anthropicClient = new Anthropic({
        apiKey: apiKey,
        fetch: core_fetch2,
        dangerouslyAllowBrowser: true,
    });

    const models = await anthropicClient.models.list();
    return models.data.map(({ id }) => id);
}

export function createClaude(opts?: typeof AnthropicInfo.configs): Provider {
    const apiKey = opts?.apiKey?.value || "";

    return {
        models: () => models(apiKey),
        client: (model) =>
            new ChatAnthropic({
                model,
                apiKey,
                clientOptions: {
                    fetch: core_fetch2,
                },
            }),
    };
}
