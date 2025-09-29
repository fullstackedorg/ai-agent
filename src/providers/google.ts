import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenAI } from "@google/genai";
import { Provider } from "@fullstacked/ai-agent/src/providers/interface";
import { ProviderInfo } from "./interface";

export const GoogleInfo: ProviderInfo = {
    id: "google",
    title: "Google",
    configs: [
        {
            id: "apiKey",
            title: "API Key",
            type: "string",
            value: "",
        },
    ],
};

async function models(apiKey: string) {
    const googleClient = new GoogleGenAI({
        apiKey,
    });

    const models = await googleClient.models.list();
    return models.page.map(({ name }) => name.slice("models/".length));
}

export function createGemini(opts?: typeof GoogleInfo.configs): Provider {
    const apiKey =
        (opts?.find(({ id }) => id === "apiKey")?.value as string) || "";

    return {
        models: () => models(apiKey),
        client: (model) =>
            new ChatGoogleGenerativeAI({
                model,
                apiKey,
            }),
    };
}
