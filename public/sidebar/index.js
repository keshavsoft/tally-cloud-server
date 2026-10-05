import companyPull from "./companyDropdown.js";
import spec from "./spec.json" with { type: "json" };

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

const startFunc = () => {
    try {
        const jsonToTag = window.ks?.jsonToTag || window.ks?.["json-to-tag"];
        if (!jsonToTag) {
            console.error("jsonToTag is not available on window.ks");
            return;
        }

        // Build the side menu dynamically from spec.json
        const createDomElement = jsonToTag.buildSpecElement(spec);
        console.log("createDomElement (sidebar) : ", createDomElement);

        const container = document.getElementById("sidebarContainer");
        if (container) {
            container.prepend(...(Array.isArray(createDomElement) ? createDomElement : [createDomElement]));
        }

        // Populate company select dropdown
        companyPull();

        // Connect click handler on Units menu item
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
        console.error("Failed to render sidebar from spec.json:", err);
    }
};

startFunc();
