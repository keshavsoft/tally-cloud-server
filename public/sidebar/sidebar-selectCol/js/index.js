import compile from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";
import companyPull from "./companyDropdown.js";

const icons = { dashboard: "house-fill", orders: "file-earmark", customers: "people" };
const rawData = ["Orders", "Customers", "Keshavsoft"];

// Lightweight native tag builder
const specToDom = (spec) => {
    if (!spec) return null;
    if (Array.isArray(spec)) return spec.map(specToDom);
    if (typeof spec !== "object") return document.createTextNode(spec);

    const isSvg = spec.tagName === "svg" || spec.tagName === "use";
    const el = isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", spec.tagName)
        : document.createElement(spec.tagName);

    Object.entries(spec.attributes || {}).forEach(([k, v]) =>
        k.startsWith("xlink:") ? el.setAttributeNS("http://www.w3.org/1999/xlink", k, v) : el.setAttribute(k, v)
    );
    if (spec.textContent) el.textContent = spec.textContent;
    (spec.children || []).forEach(child => el.append(...[specToDom(child)].flat().filter(Boolean)));
    return el;
};

const startFunc = async () => {
    try {
        const spec = await fetch(new URL("../json/spec.json", import.meta.url)).then(r => r.json());
        const menuItems = rawData.map(name => ({
            name,
            icon: icons[name.toLowerCase()] || "file-earmark"
        }));

        const compiled = compile({ specJson: spec.sidebar || spec, dataJson: { menuItems } });
        const container = document.getElementById("sidebarContainer");
        if (container) {
            container.querySelector(".sidebar")?.remove();
            container.prepend(specToDom(compiled));

            container.querySelectorAll(".nav-link").forEach(link => {
                link.onclick = (e) => {
                    if (!link.getAttribute("href") || link.getAttribute("href") === "#") e.preventDefault();
                    container.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
                    link.classList.add("active");
                };
            });
        }

        companyPull();
    } catch (err) {
        console.error("Failed to build side menu:", err);
    }
};

startFunc();
