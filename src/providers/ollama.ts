// @ts-ignore
import { Ollama as OllamaClient } from "ollama/browser";
import type * as ollama from "ollama";
import { Provider, ProviderInfo } from "./interface";
import { core_fetch2 } from "fetch";
import { ChatOllama } from "@langchain/ollama";

export const OllamaInfo = {
    id: "ollama",
    title: "Ollama",
    configs: {
        host: {
            type: "string",
            value: "http://localhost:11434",
        },
        headers: {
            type: "key-value",
            value: {},
        },
    },
};

async function models(opts: ollama.Config) {
    const ollamaClient: ollama.Ollama = new OllamaClient({
        ...opts,
        fetch: core_fetch2,
    });

    const { models } = await ollamaClient.list();

    return models.map((m) => m.name);
}

export function createOllama(opts?: typeof OllamaInfo.configs): Provider {
    const baseUrl = opts?.host?.value || OllamaInfo.configs.host.value;
    const headers = opts?.headers?.value || OllamaInfo.configs.headers.value;

    return {
        models: () =>
            models({
                host: baseUrl,
                headers,
            }),
        client: (model) =>
            new ChatOllama({
                baseUrl,
                headers,
                model,
                fetch: core_fetch2,
            }),
    };
}
