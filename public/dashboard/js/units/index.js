const startFunc = async ({ inTargetHtmlId, inData }) => {
    const localTargetHtmlId = inTargetHtmlId;

    try {
        window.ks.jsonRenderers.renderToDom({
            type: "table", appendPosition: "prepend1",
            data: inData,
            columns: ["itemName", "baseUnit"],
            targetHtmlId: localTargetHtmlId
        });
    } catch (err) {
        console.error("Error rendering simple table with json-render-table:", err);
    };
};

export default startFunc;