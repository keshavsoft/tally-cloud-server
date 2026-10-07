import companyPull from "./companyDropdown.js";

const startFunc = async () => {
    // Data
    const menuItems = [
        { name: "Orders", icon: "file-earmark" },
        { name: "Customers", icon: "people" },
        { name: "Keshavsoft", icon: "file-earmark" }
    ];

    // Fetch Blueprint
    const rawBlueprint = await fetch(new URL("../json/spec.json", import.meta.url)).then(r => r.json());
    const structureBlueprint = rawBlueprint.sidebar || rawBlueprint;

    // 1. Get structure using json-to-spec
    const spec = window.ks.jsonToSpec.buildSpecElement(
        structureBlueprint,
        { menuItems }
    );

    // 2. Render DOM using json-renderers
    const domNode = window.ks.jsonRenderers.buildSpecElement(spec);

    // 3. Mount into sidebar container
    const app = document.getElementById("sidebarContainer");
    app.querySelector(".sidebar")?.remove();
    app.prepend(...[domNode].flat().filter(Boolean));

    companyPull();
};

startFunc();
