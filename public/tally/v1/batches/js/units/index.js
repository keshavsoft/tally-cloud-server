const startFunc = async ({ inTargetHtmlId, inData }) => {
    const localTargetHtmlId = inTargetHtmlId;
    // debugger;
    try {
        // console.log("localTargetHtmlId : ", localTargetHtmlId, inData);

        window.ks.jsonRenderers.renderToDom({
            type: "table", appendPosition: "prepend1",
            data: inData,
            columns: ["Name", "Units"],
            targetHtmlId: localTargetHtmlId
        });
    } catch (err) {
        console.error("Error rendering simple table with json-render-table:", err);
    };
};

export default startFunc;