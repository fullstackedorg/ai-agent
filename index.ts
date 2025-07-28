// @ts-ignore
import { Ollama as OllamaClient } from "ollama/browser";
import type * as ollama from "ollama";
import { core_fetch2 } from "fetch";
import { ChatOllama } from "@langchain/ollama";

const opts: ollama.Config = {
    host: "http://localhost:11434",
    fetch: core_fetch2,
};
const ollamaClient: ollama.Ollama = new OllamaClient(opts);

const { models } = await ollamaClient.list();

const select = document.createElement("select");
models.forEach((m) => {
    const option = document.createElement("option");
    option.value = m.model;
    option.innerText = m.name;
    select.append(option);
});
document.body.append(select);

let chatOllama: ChatOllama;
const setOllamaModel = () => {
    chatOllama = new ChatOllama({
        model: select.value,
        fetch: core_fetch2
    });
};
setOllamaModel();
select.onchange = setOllamaModel;

const response = document.createElement("div");
document.body.append(response);

const input = document.createElement("div");
input.contentEditable = "true";
input.innerText = "Ask me anything...";

input.addEventListener("keydown", async (e) => {
    if (e.shiftKey || e.key !== "Enter") return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const prompt = input.innerText;
    input.innerText = "";
    
    const stream = await chatOllama.stream(prompt);
    for await (const chunk of stream) {
        response.innerText += chunk.content;
    }
});

document.body.append(input);
