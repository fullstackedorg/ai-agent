import * as smd from "streaming-markdown";
import { createCodeMirrorView } from "@fullstacked/codemirror-view";
import { SupportedLanguage } from "@fullstacked/codemirror-view/languages";
import { Extension } from "@codemirror/state";

export function createMarkdownStreamRenderer(
    el: HTMLElement,
    cmExtensions?: Extension[],
) {
    const renderer = smd.default_renderer(el);
    const defaultAddToken = renderer.add_token;
    renderer.add_token = function (data: any, type: any) {
        if (type !== 9 && type !== 10) {
            return defaultAddToken(data, type);
        }

        let parent = data.nodes[data.index];
        const codeView = createCodeMirrorView({
            extensions: cmExtensions || [],
        }) as ReturnType<typeof createCodeMirrorView> & {
            setAttribute(attr: string, value: string): void;
            appendChild(text: Text): void;
        };
        codeView.editing.lock();
        codeView.setAttribute = async function (attr, value) {
            if (attr !== "class") return;
            codeView.setLanguage(value as SupportedLanguage);
        };
        codeView.appendChild = (text) => {
            codeView.editorView.dispatch({
                changes: {
                    from: codeView.editorView.state.doc.length,
                    insert: text.wholeText,
                },
            });
        };
        parent = parent.appendChild(codeView.element);

        data.nodes[++data.index] = codeView;
    };
    const parser = smd.parser(renderer);
    return {
        write(md: string) {
            smd.parser_write(parser, md);
        },
        end() {
            smd.parser_end(parser);
        },
    };
}
