import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenAI } from "@google/genai";
import { ProviderInfo, Provider } from "./interface";

export const GoogleInfo: ProviderInfo<{
    apiKey: {
        title: "API Key";
        type: "string";
        value: string;
    };
}> = {
    id: "google",
    title: "Google",
    configs: {
        apiKey: {
            title: "API Key",
            type: "string",
            value: ""
        }
    }
};

async function models(apiKey: string) {
    const googleClient = new GoogleGenAI({
        apiKey
    });

    const models = await googleClient.models.list();
    return models.page.map(({ name }) => name.slice("models/".length));
}

export function createGemini(opts?: typeof GoogleInfo.configs): Provider {
    const apiKey = opts?.apiKey?.value || "";

    return {
        models: () => models(apiKey),
        client: (model) =>
            new ChatGoogleGenerativeAI({
                model,
                apiKey,
                maxRetries: 1
            })
    };
}
