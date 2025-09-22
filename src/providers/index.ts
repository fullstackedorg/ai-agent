import { ProviderInfo } from "./interface";
import { OpenAIInfo } from "./openai";
import { OllamaInfo } from "./ollama";

export function providers(): ProviderInfo[] {
    return [OllamaInfo as ProviderInfo, OpenAIInfo as ProviderInfo];
}
