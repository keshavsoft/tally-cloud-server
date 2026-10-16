import { saveClick } from "./methods/saveClick.js";
import { rowOptionsClick } from "./methods/rowOptionsClick.js";
import { cellButtonClick } from "./methods/cellButtonClick.js";

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

const startFunc = (getCompany = () => "mani9") => {
    const modalEl = document.getElementById("batchModal");
    const modalTitle = document.getElementById("batchModalTitle");
    const modalBody = document.getElementById("batchModalBody");
    const batchesButton = document.getElementById("withBatchesSideId");

    if (!modalEl || !modalTitle || !modalBody || !batchesButton || !window.bootstrap?.Modal) {
        console.error("Cannot initialize batches: required modal, button, or Bootstrap elements are missing.");
        return;
    }

    const batchModal = new window.bootstrap.Modal(modalEl);

    batchesButton.addEventListener("click", async (event) => {
        const company = getCompany() || "mani9";

        const fetchUrl = `/v2/ws/masters.stockItems.withBatches?company=${encodeURIComponent(company)}`;

        const data = await fetchData(fetchUrl);
        const stockItems = data?.data?.StockItems ?? [];

        window.ks.jsonRenderers.renderToDom({
            type: "table",
            data: stockItems,
            columns: [
                { columnName: "Name" },
                {
                    columnName: "Batches",
                    "template": {
                        "body": {
                            "tr": "buildBodyTr",
                            "cell": "buttonCell"
                        }
                    }
                }
            ],
            targetHtmlId: "ksContainerId"
        });

        let container = document.getElementById('ksContainerId');
        console.log("container : ", container);

        container.addEventListener("click", (event) => {
            const currentTarget = event.currentTarget;

            const button = event.target.closest("button");
            console.log("button : ", button);


            if (!button || !currentTarget.contains(button)) return;
            const label = button.textContent.trim().toLowerCase();
            const tr = button.closest("tr");
            if (!tr) return;

            if (label === "save") {
                saveClick({ ...event, currentTarget: button });
            } else {
                const tbody = button.closest("tbody");
                console.log("hhhhhhh : ", tbody);

                if (tbody) {
                    cellButtonClick({ ...event, currentTarget: button }, { data: stockItems, modalTitle, modalBody, batchModal });
                } else {
                    rowOptionsClick({ ...event, currentTarget: button });
                };

                // if (label === "1") {
                //     cellButtonClick({ ...event, currentTarget: button }, { data, modalTitle, modalBody, batchModal });
                // } else if (label === "options") {
                //     rowOptionsClick({ ...event, currentTarget: button });
                // };
            };
        });

    });
};

export default startFunc;
