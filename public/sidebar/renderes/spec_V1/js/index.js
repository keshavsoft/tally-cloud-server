import compile from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";
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

// 1. Get structure using json-to-spec
const spec = compile({
    inStructure: structureBlueprint.sidebar || structureBlueprint,
    inData: { menuItems },
    specJson: structureBlueprint.sidebar || structureBlueprint,
    dataJson: { menuItems }
});

// 2. Render DOM using json-renderers
const domNode = window.ks.jsonToTag.buildSpecElement(spec);

// 3. Mount into sidebar container
const app = document.getElementById("sidebarContainer");
app.querySelector(".sidebar")?.remove();
app.prepend(...[domNode].flat().filter(Boolean));

companyPull();
