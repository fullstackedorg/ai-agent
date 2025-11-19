// @ts-ignore
import { Ollama as OllamaClient } from "ollama/browser";
import type * as ollama from "ollama";
import { Provider, ProviderInfo } from "./interface";
import { core_fetch2 } from "fetch";
import { ChatOllama } from "@langchain/ollama";

export const OllamaInfo: ProviderInfo<{
    think: {
        title: "Thinking";
        type: "boolean";
        value: boolean;
    };
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
        think: {
            title: "Thinking",
            type: "boolean",
            value: true
        },
        host: {
            title: "Host",
            type: "string",
            value: ""
        },
        headers: {
            title: "Custom Headers",
            type: "key-value",
            value: []
        }
    }
};

async function models(opts: ollama.Config) {
    const ollamaClient = new OllamaClient({
        ...opts,
        fetch: core_fetch2
    }) as ollama.Ollama;

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
    const think = opts?.think?.value === undefined ? true : opts.think.value;
    return {
        models: () =>
            models({
                host: baseUrl,
                headers
            }),
        client: (model, forcedOpts: { think: boolean }) => {
            return new ChatOllama({
                baseUrl,
                headers,
                model,
                fetch: core_fetch2,
                think:
                    forcedOpts?.think === undefined ? think : forcedOpts?.think
            });
        }
    };
}
