import { readRow, readFooter } from "./methods/tableEvents.js";

const htmlId = "ledgersSideId";

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

        const fetchUrl = `/v2/ws/masters.Ledger?company=${encodeURIComponent(company)}`;

        const data = await fetchData(fetchUrl);

        const ledgerNames = data?.data.map(company => {
            return { Name: company };
        });

        const localColumns = [
            { columnName: "Name" }
        ];

        const container = window.ks.jsonRenderers.render({
            type: "table.withFooter",
            data: ledgerNames,
            columns: localColumns,
            targetHtmlId: "ksContainerId",
            appendPosition: "",
            classToApply: "",
            options: {
                showSerial: true,
                showOptions: true
            }
        });

        container.addEventListener("click", async event => {
            const button = event.target.closest("button");
            if (!button || !container.contains(button)) return;

            const label = button.textContent.trim().toLowerCase();

            try {
                if (label === "save") {
                    const result = readFooter(button);

                    const response = await fetch(`/tally/v2/create?${new URLSearchParams(result).toString()}`);

                    const data = await response.json();

                    return;
                }

                if (label === "show") {
                    const rowData = readRow(button, localColumns);
                    console.log("rowData : ", rowData);

                    const response = await fetch(`/tally/v2/delete?${new URLSearchParams(rowData).toString()}`);

                    const data = await response.json();
                    // const response = await fetch(`/tally/v2/delete?${new URLSearchParams(result).toString()}`);

                    // const data = await response.json();
                };
            } catch (error) {
                output.textContent = `${error.name}: ${error.message}`;
                console.error(error);
            }
        });


    });
};

export default startFunc;