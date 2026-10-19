import batchesClick from "./js/batches/index.js";
import receiptsClick from "./js/receipts/index.js";
import reports from "./js/reports/index.js";
import fillCompanies from "./js/fillCompanies/index.js";
import unitsSideId from "./js/masters/units/index.js";

import spec from "./spec.json" with { type: "json" };

const startFunc = () => {
    try {
        const createDomElement = window.ks.jsonToTag.buildSpecElement(spec);

        const cont1 = document.getElementById("body");
        cont1.prepend(...createDomElement);

        fillCompanies();

        batchesClick();
        unitsSideId();
        reports();
        receiptsClick();
    } catch (err) {
        console.error("Failed to render v27 sample:", err);
    };
};

startFunc();
