import "https://keshavsoft.github.io/json-renderers/dist/v13/min.js";
import companyPull from "./companyDropdown.js";

// Data
const menuItems = [
    { name: "Orders", icon: "file-earmark" },
    { name: "Customers", icon: "people" },
    { name: "Keshavsoft", icon: "file-earmark" }
];

// Fetch Blueprint
const structureBlueprint = await fetch(new URL("../json/spec.json", import.meta.url)).then(r => r.json());

// 1. Compile structure.json (HOW) + data.json (WHAT) → spec
const spec = window.ks.jsonToSpec.buildSpecElement(
    structureBlueprint.sidebar || structureBlueprint,
    { menuItems }
);

// 2. Render directly into native browser DOM elements
const domNode = window.ks.jsonToTag.buildSpecElement(spec);
const app = document.getElementById("sidebarContainer");
app.querySelector(".sidebar")?.remove();
app.prepend(...[domNode].flat().filter(Boolean));

companyPull();

