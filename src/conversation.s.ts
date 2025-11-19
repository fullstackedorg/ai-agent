import style from "style";

export const messagesClass = "messages";
export const humanMessageClass = "human";
export const inputClass = "input";
export const conversationClass = style.createClass("conversation", {
    height: "100%",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",

    [`.${messagesClass}`]: {
        width: "100%",
        flex: 1,
        overflow: "auto",

        [`.${humanMessageClass}`]: {
            textAlign: "right"
        }
    },
    [`.${inputClass}`]: {
        margin: 5
    }
});
