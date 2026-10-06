import { compile } from "https://keshavsoft.github.io/json-to-spec/dist/v1/min.js";
import { buildSpecElement } from "https://keshavsoft.github.io/json-to-dom/dist/v16/min.js";
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
    inData: dataPayload
});

// 2. Render directly via json-to-dom
const domNode = buildSpecElement({ inSpec: spec });
document.getElementById("app").appendChild(domNode);

companyPull();
