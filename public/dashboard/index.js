import companyPull from "./companyDropdown.js";
import unitsPull from "./js/units/index.js";

import spec from "./spec.json" with { type: "json" };

async function fetchData(url) {
    try {
        // 1. Wait for the initial network response
        const response = await fetch(url);

        // 2. Check if the HTTP status code is valid (200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 3. Wait for the body stream to be completely read and parsed as JSON
        const data = await response.json();
        return data;

    } catch (error) {
        // Captures network failures or thrown errors from above
        console.error("Fetch operation failed:", error);
    }
};

// Usage:

let jFLocalcompanySelect = () => {
    let jVarLocalcompanySelect = 'companySelect'
    let jVarLocalHtmlId = document.getElementById(jVarLocalcompanySelect);

    if (jVarLocalHtmlId === null === false) {
        return jVarLocalHtmlId.value.trim();
    };
};

const withBatchesSideId = () => {
    let jVarLocalunitsSideId = document.getElementById('withBatchesSideId');

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const company = jFLocalcompanySelect();

        const fetchUrl = `/v2/ws/masters.stockItems.withBatches?company=${company}`;

        const data = await fetchData(fetchUrl);

        unitsPull({
            inData: data.data?.StockItems,
            inTargetHtmlId: "ksContainerId"
        });
    });
};

const unitsSideId = () => {
    let jVarLocalunitsSideId = document.getElementById('unitsSideId');

    jVarLocalunitsSideId.addEventListener("click", async (event) => {
        const company = jFLocalcompanySelect();

        const fetchUrl = `/v2/ws/masters.unit.all?company=${company}`;

        const data = await fetchData(fetchUrl);

        unitsPull({
            inData: data.data?.Units,
            inTargetHtmlId: "ksContainerId"
        });
    });
};

const fillCompanies = async () => {

    const fetchUrl = `/v2/ws/company.fetch`;

    const data = await fetchData(fetchUrl);

    const companies = data.data.Companies.map(element => {
        return element.Name;
    });

    window.ks.jsonRenderers.renderToDom({
        type: "selectOptionsOnly", appendPosition: "prepend",
        data: companies,
        targetHtmlId: "companySelect"
    });
};

const startFunc = () => {
    try {
        const createDomElement = window.ks.jsonToTag.buildSpecElement(spec);

        const cont1 = document.getElementById("body");
        cont1.prepend(...createDomElement);

        // companyPull();

        fillCompanies();

        withBatchesSideId();
        unitsSideId();

        // let jVarLocalunitsSideId = document.getElementById('unitsSideId');

        // jVarLocalunitsSideId.addEventListener("click", async (event) => {
        //     const company = jFLocalcompanySelect();
        //     // console.log("company : ", company);

        //     const fetchUrl1 = `/v2/ws/masters.StockItem.withBatches?company=${company}`;

        //     const fetchUrl = `/v2/ws/tally.masters.units.all?company=${company}`;

        //     const data = await fetchData(fetchUrl);

        //     unitsPull({
        //         inData: data.data,
        //         inTargetHtmlId: "ksContainerId"
        //     });
        // });
    } catch (err) {
        console.error("Failed to render v27 sample:", err);
    };
};

startFunc();
