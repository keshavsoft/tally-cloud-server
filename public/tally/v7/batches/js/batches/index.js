const htmlId = "withBatchesSideId";

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

const jFLocalcompanySelect = () => {
    const companySelect = document.getElementById("companySelect");
    return companySelect?.value?.trim();
};

const startFunc = () => {
    let jVarLocalunitsSideId = document.getElementById(htmlId);

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const company = jFLocalcompanySelect();

        const fetchUrl = `/v2/ws/masters.StockItem?company=${encodeURIComponent(company)}`;

        const data = await fetchData(fetchUrl);

        const units = data?.data.map(company => {
            return { Name: company };
        });

        window.ks.jsonRenderers.render({
            type: "table.simple",
            data: units,
            columns: [
                { columnName: "Name" }
            ],
            targetHtmlId: "ksContainerId",
            appendPosition: "",
            classToApply: ""
        });
    });
};

export default startFunc;