import { default as compile } from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";
import { buildSpecElement } from "https://keshavsoft.github.io/json-to-tag/dist/v9/min.js";
import companyPull from "./companyDropdown.js";

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

const defaultIcons = {
    Dashboard: "house-fill",
    dashboard: "house-fill",
    Orders: "file-earmark",
    orders: "file-earmark",
    Products: "cart",
    products: "cart",
    Customers: "people",
    customers: "people",
    Reports: "graph-up",
    reports: "graph-up",
    Integrations: "puzzle",
    integrations: "puzzle",
    Units: "file-earmark-text",
    units: "file-earmark-text"
};

const compileWithJsonToSpec = ({ inSpecJson, inDataJson }) => {
    const compileFunc = compile || window.ks?.['json-to-spec']?.buildSpecElement || window.ks?.['json-to-spec']?.default;
    if (typeof compileFunc !== "function" || !inSpecJson) {
        return inSpecJson;
    }

    let compiled = compileFunc({
        specJson: inSpecJson,
        dataJson: inDataJson || {},
        showLog: false
    });

    if (compiled && !("tagName" in compiled) && Array.isArray(compiled.children)) {
        compiled = compiled.children;
    }

    return compiled;
};

const startFunc = async () => {
    try {
        // Load side menu spec and data
        const specUrl = new URL("../json/spec.json", import.meta.url).href;
        const dataUrl = new URL("../json/data.json", import.meta.url).href;

        const [spec, rawData] = await Promise.all([
            fetch(specUrl).then((r) => r.json()),
            fetch(dataUrl).then((r) => r.json()).catch(() => ["Orders", "Customers", "products"])
        ]);

        const buildFunc = buildSpecElement || window.ks?.jsonToTag?.buildSpecElement || window.ks?.["json-to-tag"]?.buildSpecElement;
        if (typeof buildFunc !== "function") {
            console.error("buildSpecElement function is not available");
            return;
        }

        // Normalize menu items: supports simple array ["Orders", "Customers", "products"] or object array
        const rawItems = Array.isArray(rawData) ? rawData : (rawData?.menuItems || []);
        const menuItems = rawItems.map((item) => {
            if (typeof item === "string") {
                const name = item.trim();
                const displayName = name.charAt(0).toUpperCase() + name.slice(1);
                return {
                    name: displayName,
                    icon: defaultIcons[name] || defaultIcons[displayName] || "file-earmark"
                };
            }
            return {
                name: item.name,
                icon: item.icon || defaultIcons[item.name] || "file-earmark"
            };
        });

        // Render Side Menu from json/spec.json using dynamic menuItems
        const sidebarSpec = spec.sidebar || spec;
        const compiledSidebarSpec = compileWithJsonToSpec({
            inSpecJson: sidebarSpec,
            inDataJson: { menuItems }
        });

        const sidebarElement = buildFunc(compiledSidebarSpec);
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

            // Interactive sidebar links: update active class without unwanted page jumps
            sidebarContainer.querySelectorAll(".nav-link").forEach((link) => {
                link.addEventListener("click", (e) => {
                    const href = link.getAttribute("href");
                    if (!href || href === "#") {
                        e.preventDefault();
                    }
                    sidebarContainer.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
                    link.classList.add("active");
                });
            });
        }

        // Populate company dropdown
        companyPull();

        // Hook up Units click handler for live data
        const jVarLocalunitsSideId = document.getElementById('unitsSideId');
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
        console.error("Failed to build side menu:", err);
    }
};

startFunc();
