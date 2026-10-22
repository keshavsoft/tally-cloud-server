import { saveClick } from "./methods/saveClick.js";
import { rowOptionsClick } from "./methods/rowOptionsClick.js";
import { cellButtonClick } from "./methods/cellButtonClick.js";

import columns from "./columns.json" with {type: "json"};

const htmlId = "ReceiptsId";

async function fetchData(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        // Captures network failures or thrown errors from above
        console.error("Fetch operation failed:", error);
    }
};

const startFunc = () => {
    const batchesButton = document.getElementById(htmlId);

    batchesButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const company = document.getElementById("companySelect")?.value?.trim();

        if (!company) {
            console.error("Select a company before loading batches.");
            return;
        };

        const fetchUrl = `/v2/ws/vouchers.receipts.show.all?company=${encodeURIComponent(company)}`;

        const data = await fetchData(fetchUrl);

        const Receipts = data?.data?.Receipts ?? [];

        window.ks.jsonRenderers.render({
            type: "table.simple",
            data: Receipts,
            columns,
            targetHtmlId: "ksContainerId",
            appendPosition: "",
            classToApply: ""
        });
    });
};

export default startFunc;