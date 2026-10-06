// 1. Import compiler & DOM engine directly via CDN (using json-to-dom)
import compile from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";
import { specToDom, buildSpecElement } from "https://keshavsoft.github.io/json-to-dom/dist/v31/min.js";
import companyPull from "./companyDropdown.js";

// Data
const menuItems = [
    { name: "Orders", icon: "file-earmark" },
    { name: "Customers", icon: "people" },
    { name: "Keshavsoft", icon: "file-earmark" }
];

// Fetch Blueprint
const structureBlueprint = await fetch(new URL("../json/spec.json", import.meta.url)).then(r => r.json());

// 2. Compile structure.json (HOW) + data.json (WHAT) → spec
const spec = compile({
    specJson: structureBlueprint.sidebar || structureBlueprint,
    dataJson: { menuItems }
});

// 3. Render directly into native browser DOM elements using json-to-dom
const buildFunc = buildSpecElement || specToDom;
const domNode = buildFunc({ inSpec: spec, spec });
const app = document.getElementById("sidebarContainer");
app.querySelector(".sidebar")?.remove();
app.prepend(...[domNode].flat().filter(Boolean));

// 4. Handle active selection & company dropdown
app.querySelectorAll(".nav-link").forEach(link => {
    link.onclick = (e) => {
        if (!link.getAttribute("href") || link.getAttribute("href") === "#") e.preventDefault();
        app.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
    };
});

companyPull();
