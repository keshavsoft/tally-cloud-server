const startFunc = (inData, inColumns) => {
    window.ks.jsonRenderers.render({
        type: "table.simple",
        data: inData,
        columns: inColumns,
        targetHtmlId: "ksContainerId",
        options: {
            showSerial: true
        },
        appendPosition: "",
        classToApply: ""
    });
};

export default startFunc;