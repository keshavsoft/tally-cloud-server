import compile from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";
import { buildSpecElement } from "https://keshavsoft.github.io/json-to-tag/dist/v9/min.js";
import companyPull from "./companyDropdown.js";

const defaultIcons = {
    dashboard: "house-fill",
    orders: "file-earmark",
    products: "cart",
    customers: "people",
    reports: "graph-up",
    integrations: "puzzle",
    units: "file-earmark-text"
};
const rawData = ["Orders", "Customers", "Keshavsoft"];

const compileWithJsonToSpec = ({ inSpecJson, inDataJson = {} }) => {
    const fn = compile || window.ks?.["json-to-spec"]?.buildSpecElement || window.ks?.["json-to-spec"]?.default;
    if (typeof fn !== "function" || !inSpecJson) return inSpecJson;

    const res = fn({ specJson: inSpecJson, dataJson: inDataJson, showLog: false });
    return res?.children && !res.tagName ? res.children : res;
};

const startFunc = async () => {
    try {
        const [spec] = await Promise.all([
            fetch(new URL("../json/spec.json", import.meta.url)).then(r => r.json()),
        ]);

        const buildFunc = buildSpecElement || window.ks?.jsonToTag?.buildSpecElement || window.ks?.["json-to-tag"]?.buildSpecElement;
        if (typeof buildFunc !== "function") return console.error("buildSpecElement function is not available");

        const rawItems = Array.isArray(rawData) ? rawData : (rawData?.menuItems || []);
        const menuItems = rawItems.map(item => {
            const rawName = (typeof item === "string" ? item : item?.name || "").trim();
            const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            const icon = (typeof item === "object" && item?.icon) || defaultIcons[rawName.toLowerCase()] || "file-earmark";
            return { name, icon };
        });

        const compiled = compileWithJsonToSpec({
            inSpecJson: spec.sidebar || spec,
            inDataJson: { menuItems }
        });

        const sidebarElement = buildFunc(compiled);
        const sidebarContainer = document.getElementById("sidebarContainer");
        if (sidebarContainer && sidebarElement) {
            sidebarContainer.querySelector(".sidebar")?.remove();
            sidebarContainer.prepend(...[sidebarElement].flat());

            sidebarContainer.querySelectorAll(".nav-link").forEach(link => {
                link.addEventListener("click", (e) => {
                    const href = link.getAttribute("href");
                    if (!href || href === "#") e.preventDefault();
                    sidebarContainer.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
                    link.classList.add("active");
                });
            });
        }

        companyPull();
    } catch (err) {
        console.error("Failed to build side menu:", err);
    }
};

startFunc();
