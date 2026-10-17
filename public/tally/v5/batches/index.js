import unitsPull from "./js/units/index.js";
import batchesClick from "./js/batches/index.js";
import reports from "./js/reports/index.js";

import spec from "./spec.json" with { type: "json" };

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

// Usage:

const jFLocalcompanySelect = () => {
    const companySelect = document.getElementById("companySelect");
    return companySelect?.value?.trim();
};

const unitsSideId = () => {
    let jVarLocalunitsSideId = document.getElementById('unitsSideId');

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const company = jFLocalcompanySelect();

        const fetchUrl = `/v2/ws/masters.units.all?company=${encodeURIComponent(company)}`;

        const data = await fetchData(fetchUrl);

        window.ks.jsonRenderers.renderToDom({
            type: "table",
            data: data?.data?.Units,
            columns: [
                { columnName: "Name" }
            ],
            targetHtmlId: "ksContainerId"
        });
    });
};

const fillCompanies = async () => {

    const fetchUrl = `/v2/ws/company.fetch`;

    const data = await fetchData(fetchUrl);

    const companies = data?.data?.map(element => {
        return { Name: element }
    });

    // console.log("companies : ", companies);

    window.ks.jsonRenderers.renderToDom({
        type: "selectOptionsOnly", appendPosition: "prepend",
        data: companies,
        columns: [
            { columnName: "Name" }
        ],
        targetHtmlId: "companySelect"
    });
};

const startFunc = () => {
    try {
        const createDomElement = window.ks.jsonToTag.buildSpecElement(spec);

        const cont1 = document.getElementById("body");
        cont1.prepend(...createDomElement);

        fillCompanies();

        batchesClick();
        unitsSideId();
        reports();
    } catch (err) {
        console.error("Failed to render v27 sample:", err);
    };
};

startFunc();
