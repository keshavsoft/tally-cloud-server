import toDom from "../../common/toDom.js";

const htmlId = "ledgersSideId";

const jFLocalcompanySelect = () => {
    const companySelect = document.getElementById("companySelect");
    return companySelect?.value?.trim();
};

const startFunc = () => {
    let jVarLocalunitsSideId = document.getElementById(htmlId);

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const company = jFLocalcompanySelect();

        const fetchUrl = `/v2/ws/masters.Ledger?company=${encodeURIComponent(company)}`;

        const response = await fetch(fetchUrl);
        const data = await response.json();

        toDom(data?.data, [
            { columnName: "tallyName" },
            { columnName: "parent" },
            { columnName: "tbalopening" },
            { columnName: "closingbalance" },
            { columnName: "closingdronacctvalue" },
            { columnName: "closingonacctvalue" },
            { columnName: "onaccountvalue" },
            { columnName: "ledopeningbalance" }
        ]);
    });
};

export default startFunc;