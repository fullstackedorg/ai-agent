// @ts-ignore
import { Ollama as OllamaClient } from "ollama/browser";
import type * as ollama from "ollama";
import { Provider } from "./interface";
import { core_fetch2 } from "fetch";
import { ChatOllama } from "@langchain/ollama";

async function models(opts: ollama.Config) {
    const ollamaClient: ollama.Ollama = new OllamaClient({
        ...opts,
        fetch: core_fetch2,
    });

    const { models } = await ollamaClient.list();

    return models.map((m) => m.name);
}

type OllamaOptions = {
    host: string;
    headers: { [key: string]: string };
};

export function createOllama(opts?: Partial<OllamaOptions>): Provider {
    const baseUrl = opts?.host || "http://localhost:11434";
    const headers = opts?.headers || {};

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
