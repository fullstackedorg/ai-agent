import style, { CSSProperties } from "style";

const htmlBodyStyle: CSSProperties = {
    margin: 0,
    fontFamily: "sans-serif",
    padding: 10,
    height: "100%",
    display: "flex",
    flexDirection: "column"
};

style.createGlobalStyle({
    "*": {
        boxSizing: "border-box"
    },

    html: htmlBodyStyle,
    body: htmlBodyStyle
});
