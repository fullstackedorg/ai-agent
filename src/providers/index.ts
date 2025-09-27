import { ProviderInfo } from "./interface";
import { OpenAIInfo, createOpenAI } from "./openai";
import { OllamaInfo, createOllama } from "./ollama";
import { Provider } from "./interface";
import { AnthropicInfo, createClaudeAI } from "./anthropic";

export function providers(): ProviderInfo[] {
    return [OllamaInfo, OpenAIInfo, AnthropicInfo];
}

export function getProvider(providerInfo: ProviderInfo) {
    switch (providerInfo.id) {
        case "ollama":
            return createOllama(providerInfo.configs);
        case "openai":
            return createOpenAI(providerInfo.configs);
        case "anthropic":
            return createClaudeAI(providerInfo.configs);
    }
    return null;
}
