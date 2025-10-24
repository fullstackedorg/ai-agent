import { ProviderInfo } from "./interface";
import { OpenAIInfo, createOpenAI } from "./openai";
import { OllamaInfo, createOllama } from "./ollama";
import { Provider } from "./interface";
import { AnthropicInfo, createClaude } from "./anthropic";
import { GoogleInfo, createGemini } from "./google";
import { createGrok, xAIInfo } from "./xai";
import { DeepSeekInfo, createDeepSeek } from "./deepseek";
import { MistralInfo, createMistral } from "./mistral";

export const providersInfo = {
    ollama: OllamaInfo,
    openai: OpenAIInfo,
    antropic: AnthropicInfo,
    google: GoogleInfo,
    xai: xAIInfo,
    deepseek: DeepSeekInfo,
    mistral: MistralInfo,
} as const;

export function getProvider(providerInfo: ProviderInfo<any>) {
    switch (providerInfo.id) {
        case "ollama":
            return createOllama(providerInfo.configs);
        case "openai":
            return createOpenAI(providerInfo.configs);
        case "anthropic":
            return createClaude(providerInfo.configs);
        case "google":
            return createGemini(providerInfo.configs);
        case "xai":
            return createGrok(providerInfo.configs);
        case "deepseek":
            return createDeepSeek(providerInfo.configs);
        case "mistral":
            return createMistral(providerInfo.configs);
    }
    return null;
}
