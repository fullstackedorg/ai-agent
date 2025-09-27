import { ProviderInfo } from "./interface";
import { OpenAIInfo, createOpenAI } from "./openai";
import { OllamaInfo, createOllama } from "./ollama";
import { Provider } from "./interface";
import { AnthropicInfo, createClaude } from "./anthropic";
import { GoogleInfo, createGemini } from "./google";

export function providers(): ProviderInfo[] {
    return [OllamaInfo, OpenAIInfo, AnthropicInfo, GoogleInfo];
}

export function getProvider(providerInfo: ProviderInfo) {
    switch (providerInfo.id) {
        case "ollama":
            return createOllama(providerInfo.configs);
        case "openai":
            return createOpenAI(providerInfo.configs);
        case "anthropic":
            return createClaude(providerInfo.configs);
        case "google":
            return createGemini(providerInfo.configs);
    }
    return null;
}
