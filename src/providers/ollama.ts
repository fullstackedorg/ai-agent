// @ts-ignore
import { Ollama as OllamaClient } from "ollama/browser";
import type * as ollama from "ollama";
import { Provider, ProviderInfo } from "./interface";
import { core_fetch2 } from "fetch";
import { ChatOllama } from "@langchain/ollama";

export const OllamaInfo: ProviderInfo<{
    host: {
        title: "Host";
        type: "string";
        value: string;
    };
    headers: {
        title: "Custom Headers";
        type: "key-value";
        value: [string, string][];
    };
}> = {
    id: "ollama",
    title: "Ollama",
    configs: {
        host: {
            title: "Host",
            type: "string",
            value: "",
        },
        headers: {
            title: "Custom Headers",
            type: "key-value",
            value: [],
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

function keyValueArrToObject(arr: [string, string][]) {
    const obj = {};
    arr.forEach(([key, value]) => (key ? (obj[key] = value) : null));
    return obj;
}

export function createOllama(opts?: typeof OllamaInfo.configs): Provider {
    const baseUrl = opts?.host?.value || "http://localhost:11434";
    const headers = keyValueArrToObject(opts?.headers?.value || []);
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
