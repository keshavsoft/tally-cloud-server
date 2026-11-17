import toDom from "../../common/toDom.js";

const jFLocalcompanySelect = () => {
    const companySelect = document.getElementById("companySelect");
    return companySelect?.value?.trim();
};

const startFunc = () => {
    let jVarLocalunitsSideId = document.getElementById('withBatchesSideId');

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const company = jFLocalcompanySelect();

        const fetchUrl = `/v2/ws/masters.StockItem?company=${encodeURIComponent(company)}`;

        const response = await fetch(fetchUrl);
        const data = await response.json();

        toDom(data?.data, [
            { columnName: "tallyName" }
        ]);
    });
};

export default startFunc;