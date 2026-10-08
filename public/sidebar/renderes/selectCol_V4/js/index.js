import compile from "https://keshavsoft.github.io/json-to-spec/dist/v23/min.js";
import { specToDom, buildSpecElement } from "https://keshavsoft.github.io/json-to-dom/dist/v31/min.js";
import companyPull from "./companyDropdown.js";

// Blueprint & Data Payload
const rawBlueprint = await fetch(new URL("../json/spec.json", import.meta.url)).then(r => r.json());
const structureBlueprint = rawBlueprint.sidebar || rawBlueprint;

const dataPayload = {
    menuItems: [
        { name: "Orders", icon: "file-earmark" },
        { name: "Customers", icon: "people" },
        { name: "Keshavsoft", icon: "file-earmark" }
    ]
};

// 1. Compile structure + data into spec
const spec = compile({
    inStructure: structureBlueprint,
    inData: dataPayload,
    specJson: structureBlueprint,
    dataJson: dataPayload
});

// 2. Render directly via json-to-dom
const buildFunc = buildSpecElement || specToDom;
const domNode = buildFunc({ inSpec: spec, spec });
const app = document.getElementById("app") || document.getElementById("sidebarContainer");
app.replaceChildren(...[domNode].flat().filter(Boolean));

companyPull();

