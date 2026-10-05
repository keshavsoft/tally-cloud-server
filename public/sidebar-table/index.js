import { default as compile } from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";
import companyPull from "./companyDropdown.js";
import spec from "./spec.json" with { type: "json" };
import dataJson from "./data.json" with { type: "json" };

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch operation failed:", error);
    }
}

let jFLocalcompanySelect = () => {
    let jVarLocalcompanySelect = 'companySelect';
    let jVarLocalHtmlId = document.getElementById(jVarLocalcompanySelect);
    if (jVarLocalHtmlId !== null) {
        return jVarLocalHtmlId.value.trim();
    }
};

const compileWithJsonToSpec = ({ inSpecJson, inDataJson }) => {
    const compileFunc = compile || window.ks?.['json-to-spec']?.buildSpecElement || window.ks?.['json-to-spec']?.default;
    if (typeof compileFunc !== "function" || !inSpecJson) {
        return inSpecJson;
    }

    const normalizedData = Array.isArray(inDataJson) ? { data: inDataJson, rows: inDataJson } : inDataJson;

    let compiled = compileFunc({
        specJson: inSpecJson,
        dataJson: normalizedData,
        showLog: false
    });

    if (compiled && !("tagName" in compiled) && Array.isArray(compiled.children)) {
        compiled = compiled.children;
    }

    return compiled;
};

const startFunc = () => {
    try {
        const jsonToTag = window.ks?.jsonToTag || window.ks?.["json-to-tag"];
        if (!jsonToTag) {
            console.error("jsonToTag is not available on window.ks");
            return;
        }

        // 1. Render Left Menu from spec.json (sidebar config)
        const sidebarSpec = spec.sidebar || (Array.isArray(spec) ? spec[0] : spec);
        const compiledSidebarSpec = compileWithJsonToSpec({
            inSpecJson: sidebarSpec,
            inDataJson: dataJson
        });

        const sidebarElement = jsonToTag.buildSpecElement(compiledSidebarSpec);
        const sidebarContainer = document.getElementById("sidebarContainer");
        if (sidebarContainer && sidebarElement) {
            const existingSidebar = sidebarContainer.querySelector(".sidebar");
            if (existingSidebar) {
                existingSidebar.remove();
            }
            if (Array.isArray(sidebarElement)) {
                sidebarContainer.prepend(...sidebarElement);
            } else {
                sidebarContainer.prepend(sidebarElement);
            }
        }

        // 2. Render Table from spec.json (table config) using data.json
        const tableSpec = spec.table || (Array.isArray(spec) ? spec[1] : null);
        if (tableSpec) {
            const compiledTableSpec = compileWithJsonToSpec({
                inSpecJson: tableSpec,
                inDataJson: dataJson
            });

            const tableElement = jsonToTag.buildSpecElement(compiledTableSpec);
            const tableContainer = document.getElementById("ksContainerId");
            if (tableContainer && tableElement) {
                if (Array.isArray(tableElement)) {
                    tableContainer.replaceChildren(...tableElement);
                } else {
                    tableContainer.replaceChildren(tableElement);
                }
            }
        }

        // 3. Populate company dropdown
        companyPull();

        // 4. Hook up Units click handler for live data
        let jVarLocalunitsSideId = document.getElementById('unitsSideId');
        if (jVarLocalunitsSideId) {
            jVarLocalunitsSideId.addEventListener("click", async (event) => {
                event.preventDefault();
                const company = jFLocalcompanySelect();

                const fetchUrl = `/v2/ws/masters.StockItem.withBatches?company=${company}`;
                const data = await fetchData(fetchUrl);

                if (window.ks?.jsonRenderers?.renderToDom && data?.data) {
                    window.ks.jsonRenderers.renderToDom({
                        flavor: "simple",
                        data: data.data,
                        columns: ["itemName", "baseUnit"],
                        targetHtmlId: "ksContainerId"
                    });
                }
            });
        }
    } catch (err) {
        console.error("Failed to build side menu and table:", err);
    }
};

startFunc();
