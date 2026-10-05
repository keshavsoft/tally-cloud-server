// import { render } from "https://keshavsoft.github.io/json-render-table/dist/v8/min.js";

import stockItems from './stockItems.json' with {type: 'json'};

const startFunc = async ({ inTargetHtmlId, inJsonUrl, inData }) => {
    const localTargetHtmlId = inTargetHtmlId;
    const localJsonUrl = inJsonUrl;

    try {
        window.ks.jsonRenderers.renderToDom({
            flavor: "simple",
            data: inData,
            columns: ["itemName", "baseUnit"],
            targetHtmlId: localTargetHtmlId
        });
    } catch (err) {
        console.error("Error rendering simple table with json-render-table:", err);
        const localContainer = document.getElementById(localTargetHtmlId);
        if (localContainer) {
            localContainer.innerHTML = `<div class="text-danger p-3">Error rendering table: ${err.message}</div>`;
        }
    }
};

export default startFunc;