import { ProviderInfo } from "./interface";
import { OpenAIInfo, createOpenAI } from "./openai";
import { OllamaInfo, createOllama } from "./ollama";
import { Provider } from "./interface";

export function providers(): ProviderInfo[] {
    return [OllamaInfo, OpenAIInfo];
}

export function getProvider(providerInfo: ProviderInfo) {
    switch (providerInfo.id) {
        case "ollama":
            return createOllama(providerInfo.configs);
        case "openai":
            return createOpenAI(providerInfo.configs);
    }
    return null;
}
