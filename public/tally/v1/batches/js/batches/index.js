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
    let jVarLocalunitsSideId = document.getElementById('withBatchesSideId');

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const company = "mani9"

        const fetchUrl = `/v2/ws/masters.stockItems.withBatches?company=${company}`;

        const data = await fetchData(fetchUrl);

        window.ks.jsonRenderers.renderToDom({
            type: "table",
            data: data?.data?.StockItems,
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
    });
};

startFunc();