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

        const container = window.ks.jsonRenderers.render({
            type: "table.withFooter",
            data: ledgerNames,
            columns: [
                { columnName: "Name" }
            ],
            targetHtmlId: "ksContainerId",
            appendPosition: "",
            classToApply: "",
            options: {
                showSerial: true,
                showOptions: true
            }
        });

        console.log("container : ", container);

        container.addEventListener("click", async event => {
            const button = event.target.closest("button");
            if (!button || !container.contains(button)) return;

            const label = button.textContent.trim().toLowerCase();

            try {
                if (label === "save") {
                    const result = readFooter(button);
                    console.log("result : ", result);

                    // const response = await fetch(`/tally/v1/import/masters.Ledger.${result.Name}`);
                    // const response = await fetch(`/tally/v1/import?${result}`);

                    const response = await fetch(`/tally/v1/import?${new URLSearchParams(result).toString()}`);

                    const data = await response.json();
                    // output.textContent = JSON.stringify({ action: "footer-save", data: result }, null, 2);
                    return;
                }

                if (label === "show") {
                    const result = readRow(button, columns.map(column => column.columnName));
                    output.textContent = JSON.stringify({ action: "row-options", data: result }, null, 2);
                }
            } catch (error) {
                output.textContent = `${error.name}: ${error.message}`;
                console.error(error);
            }
        });


    });
};

export default startFunc;