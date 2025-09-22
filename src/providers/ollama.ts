// @ts-ignore
import { Ollama as OllamaClient } from "ollama/browser";
import type * as ollama from "ollama";
import { Provider, ProviderInfo } from "./interface";
import { core_fetch2 } from "fetch";
import { ChatOllama } from "@langchain/ollama";

export const OllamaInfo: ProviderInfo = {
    id: "ollama",
    title: "Ollama",
    configs: [
        {
            id: "host",
            title: "Host",
            type: "string",
            value: "http://localhost:11434",
        },
        {
            id: "headers",
            title: "Custom Headers",
            type: "key-value",
            value: {},
        },
    ],
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
    const baseUrl =
        (opts?.find(({ id }) => id === "host")?.value as string) ||
        "http://localhost:11434";
    const headers =
        (opts?.find(({ id }) => id === "headers")?.value as {}) || {};

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
