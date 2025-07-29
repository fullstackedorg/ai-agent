import { core_fetch2 } from "fetch";
import { Provider } from "./interface";
import openai from "openai";
import { ChatOpenAI } from "@langchain/openai";

async function models(opts: OpenAIOptions) {
    const openAIClient = new openai({
        apiKey: opts.apiKey,
        fetch: core_fetch2,
        dangerouslyAllowBrowser: true,
    });

    const models = await openAIClient.models.list();
    return models.data.map(({ id }) => id);
}

type OpenAIOptions = {
    apiKey: string;
};

export function createOpenAI(opts: OpenAIOptions): Provider {
    return {
        models: () => models(opts),
        client: (model) =>
            new ChatOpenAI({
                model,
                apiKey: opts.apiKey,
                configuration: {
                    fetch: core_fetch2,
                },
            }),
    };
}
