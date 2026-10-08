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
document.getElementById("sidebarContainer").prepend((window.ks['json-renderers']?.buildSpecElement || window.ks.jsonToTag.buildSpecElement)(spec));
document.querySelector(".btn-toolbar").prepend(window.ks.jsonToTag.buildSpecElement(structureBlueprint.companySelect));

companyPull();
