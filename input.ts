type HumanInputOptions = {
    placeholderText: string;
    onSubmit(text: string): void;
};

export function createHumanInput(opts?: Partial<HumanInputOptions>) {
    const placeholder = opts?.placeholderText || "Ask me anything...";
    const input = document.createElement("div");
    input.contentEditable = "true";
    input.innerText = placeholder;

    input.addEventListener("focus", () => {
        if(input.innerText !== placeholder) return;
        input.innerText = "";
    })

    input.addEventListener("blur", () => {
        if(input.innerText !== "") return;
        input.innerText = placeholder;
    })

    input.addEventListener("keydown", async (e) => {
        if (e.shiftKey || e.key !== "Enter") return;
        e.preventDefault();
        e.stopPropagation();

        const text = input.innerText;
        opts.onSubmit(text);

        input.innerText = "";
        input.blur();
    });

    return input;
}
